"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  LockKeyhole,
  Plus,
  UploadCloud,
  X,
} from "lucide-react";

import { uploadConfig } from "@/config/upload";
import { createClient } from "@/lib/supabase/client";
import {
  cancelMeetingDraftAction,
  finalizeMeetingDraftAction,
  prepareMeetingDraftAction,
  type MeetingIntakeActionState,
} from "@/features/meetings/actions";
import type { ActiveProjectOption } from "@/features/meetings/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface MeetingIntakeFormProps {
  projects: ActiveProjectOption[];
}

type UploadStatus = "idle" | "uploading" | "uploaded" | "error";

interface SelectedFile {
  id: string;
  file: File;
  status: UploadStatus;
  error?: string;
}

const initialActionState: MeetingIntakeActionState = {
  success: false,
  message: null,
  fieldErrors: {},
};

export function MeetingIntakeForm({ projects }: MeetingIntakeFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [pastedText, setPastedText] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [participants, setParticipants] = useState<string[]>([""]);
  const [state, setState] = useState(initialActionState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pastedTextCount = pastedText.length;
  const hasSource =
    selectedFiles.length > 0 || pastedText.trim().length > 0;

  const sourcePreview = useMemo(
    () => [
      ...selectedFiles.map((item, index) => ({
        key: item.id,
        order: index + 1,
        label: item.file.name,
        detail: formatBytes(item.file.size),
      })),
      ...(pastedText.trim()
        ? [
            {
              key: "pasted-text",
              order: selectedFiles.length + 1,
              label: "Pasted meeting notes",
              detail: `${pastedTextCount.toLocaleString()} characters`,
            },
          ]
        : []),
    ],
    [pastedText, pastedTextCount, selectedFiles],
  );

  function handleFiles(files: FileList | null) {
    if (!files) return;

    const nextFiles = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: "idle" as const,
    }));

    setSelectedFiles((current) =>
      [...current, ...nextFiles].slice(0, uploadConfig.maxFiles),
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(formData: FormData) {
    setState(initialActionState);

    if (!privacyAccepted) {
      setState({
        ...initialActionState,
        message: "Please confirm the sensitive-data notice.",
        fieldErrors: {
          privacy:
            "Confirm that the uploaded content is appropriate for this workspace.",
        },
      });
      return;
    }

    setIsSubmitting(true);
    let preparedMeetingId: string | undefined;
    const uploadedPaths: string[] = [];
    try {
      const participantValues = participants
        .map((value) => value.trim())
        .filter(Boolean);

      const preparation = await prepareMeetingDraftAction({
        privacyAccepted,
        metadata: {
          projectId: String(formData.get("projectId") ?? ""),
          title: String(formData.get("title") ?? ""),
          meetingDate: String(formData.get("meetingDate") ?? ""),
          meetingTime:
            String(formData.get("meetingTime") ?? "").trim() || null,
          participants: participantValues,
        },
        files: selectedFiles.map((item, index) => ({
          originalFileName: item.file.name,
          mimeType: item.file.type || inferMimeType(item.file.name),
          fileSizeBytes: item.file.size,
          sourceOrder: index,
        })),
      });

      if (!preparation.success || !preparation.meetingId) {
        setState(preparation);
        return;
      }

      preparedMeetingId = preparation.meetingId;
      const supabase = createClient();

      for (const upload of preparation.uploads ?? []) {
        const selected = selectedFiles[upload.sourceOrder];

        setSelectedFiles((current) =>
          current.map((item) =>
            item.id === selected.id
              ? { ...item, status: "uploading", error: undefined }
              : item,
          ),
        );

        const { error } = await supabase.storage
          .from(uploadConfig.bucket)
          .uploadToSignedUrl(upload.storagePath, upload.token, selected.file, {
            contentType: upload.mimeType,
          });

        if (error) {
          setSelectedFiles((current) =>
            current.map((item) =>
              item.id === selected.id
                ? {
                    ...item,
                    status: "error",
                    error: "Upload failed. Please try again.",
                  }
                : item,
            ),
          );
          throw new Error(`Unable to upload ${selected.file.name}.`);
        }

        uploadedPaths.push(upload.storagePath);
        setSelectedFiles((current) =>
          current.map((item) =>
            item.id === selected.id
              ? { ...item, status: "uploaded", error: undefined }
              : item,
          ),
        );
      }

      const finalized = await finalizeMeetingDraftAction({
      meetingId: preparation.meetingId,
      uploadedFiles: (preparation.uploads ?? []).map((upload) => {
        const { token, ...uploadedFile } = upload;
        void token;

        return uploadedFile;
      }),
      pastedText: pastedText.trim() || null,
      pastedTextSourceOrder: pastedText.trim()
        ? selectedFiles.length
        : null,
    });


      if (!finalized.success || !finalized.reviewPath) {
        await cancelMeetingDraftAction({
          meetingId: preparation.meetingId,
          storagePaths: uploadedPaths,
        });
        setSelectedFiles((current) =>
          current.map((item) => ({ ...item, status: "idle", error: undefined })),
        );
        setState(finalized);
        return;
      }

      router.push(finalized.reviewPath);
    } catch (error) {
      if (preparedMeetingId) {
        await cancelMeetingDraftAction({
          meetingId: preparedMeetingId,
          storagePaths: uploadedPaths,
        });
      }

      setState({
        ...initialActionState,
        message:
          error instanceof Error
            ? error.message
            : "We could not save the meeting. Your entered information is still available.",
        fieldErrors: {},
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {state.message ? (
        <div
          role="alert"
          className="flex gap-3 rounded-lg border border-destructive/20 bg-destructive-background p-4 text-sm text-destructive-foreground"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{state.message}</p>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Meeting information</CardTitle>
          <CardDescription>
            Add clear context before uploading or pasting the original notes.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <Field
            label="Related project"
            required
            error={state.fieldErrors.projectId}
            className="md:col-span-2"
          >
            <select
              name="projectId"
              defaultValue=""
              className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm shadow-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              aria-invalid={Boolean(state.fieldErrors.projectId)}
            >
              <option value="" disabled>
                Select an active project
              </option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Meeting title"
            required
            error={state.fieldErrors.title}
            className="md:col-span-2"
          >
            <Input
              name="title"
              placeholder="Example: Sprint 1 planning and dependency review"
              aria-invalid={Boolean(state.fieldErrors.title)}
            />
          </Field>

          <Field
            label="Meeting date"
            required
            error={state.fieldErrors.meetingDate}
          >
            <Input
              name="meetingDate"
              type="date"
              aria-invalid={Boolean(state.fieldErrors.meetingDate)}
            />
          </Field>

          <Field
            label="Meeting time"
            helper="Optional. Leave blank when the time is not relevant."
            error={state.fieldErrors.meetingTime}
          >
            <Input
              name="meetingTime"
              type="time"
              aria-invalid={Boolean(state.fieldErrors.meetingTime)}
            />
          </Field>

          <div className="space-y-3 md:col-span-2">
            <div>
              <label className="text-sm font-medium text-foreground">
                Participants <span className="text-destructive">*</span>
              </label>
              <p className="mt-1 text-xs text-muted-foreground">
                Store participant names as meeting metadata.
              </p>
            </div>

            {participants.map((participant, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={participant}
                  onChange={(event) =>
                    setParticipants((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? event.target.value : item,
                      ),
                    )
                  }
                  placeholder={`Participant ${index + 1}`}
                  aria-label={`Participant ${index + 1}`}
                />
                {participants.length > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={`Remove participant ${index + 1}`}
                    onClick={() =>
                      setParticipants((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                  >
                    <X />
                  </Button>
                ) : null}
              </div>
            ))}

            {state.fieldErrors.participants ? (
              <p className="text-xs text-destructive">
                {state.fieldErrors.participants}
              </p>
            ) : null}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setParticipants((current) => [...current, ""])
              }
            >
              <Plus />
              Add participant
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meeting sources</CardTitle>
          <CardDescription>
            Upload PDF, DOCX, or TXT files, paste notes, or use both.
            Every source is preserved separately and in the order shown.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              multiple
              className="sr-only"
              onChange={(event) => handleFiles(event.target.files)}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 py-9 text-center transition-colors hover:border-primary/50 hover:bg-secondary/40"
            >
              <span className="flex size-11 items-center justify-center rounded-lg bg-secondary text-primary">
                <UploadCloud className="size-5" />
              </span>
              <span className="mt-3 text-sm font-semibold text-foreground">
                Choose meeting documents
              </span>
              <span className="mt-1 text-xs leading-5 text-muted-foreground">
                Up to {uploadConfig.maxFiles} files, {uploadConfig.maxFileSizeMb} MB each.
                Text-based PDF, DOCX, and TXT only.
              </span>
            </button>
          </div>

          {selectedFiles.length > 0 ? (
            <div className="space-y-2">
              {selectedFiles.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
                >
                  <FileText className="size-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(item.file.size)}
                    </p>
                    {item.error ? (
                      <p className="mt-1 text-xs text-destructive">
                        {item.error}
                      </p>
                    ) : null}
                  </div>
                  {item.status === "uploading" ? (
                    <Loader2 className="size-4 animate-spin text-primary" />
                  ) : item.status === "uploaded" ? (
                    <CheckCircle2 className="size-4 text-success" />
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${item.file.name}`}
                      onClick={() =>
                        setSelectedFiles((current) =>
                          current.filter((file) => file.id !== item.id),
                        )
                      }
                    >
                      <X />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : null}

          {state.fieldErrors.files || state.fieldErrors.sources ? (
            <p className="text-xs text-destructive">
              {state.fieldErrors.files ?? state.fieldErrors.sources}
            </p>
          ) : null}

          <div className="relative py-1 text-center">
            <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
            <span className="relative bg-card px-3 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
              and / or
            </span>
          </div>

          <Field
            label="Paste meeting notes"
            helper={`Maximum ${uploadConfig.maxPastedTextCharacters.toLocaleString()} characters.`}
            error={state.fieldErrors.pastedText}
          >
            <Textarea
              value={pastedText}
              onChange={(event) => setPastedText(event.target.value)}
              rows={10}
              placeholder="Paste the original meeting notes here. The text will be preserved unchanged as a meeting source."
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {pastedTextCount.toLocaleString()} /{" "}
              {uploadConfig.maxPastedTextCharacters.toLocaleString()}
            </p>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Source review</CardTitle>
          <CardDescription>
            Confirm the original sources that will be available in Human Review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sourcePreview.length > 0 ? (
            <ol className="space-y-2">
              {sourcePreview.map((source) => (
                <li
                  key={source.key}
                  className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
                >
                  <Badge variant="secondary">{source.order}</Badge>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {source.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {source.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="rounded-lg border border-dashed border-border px-5 py-8 text-center">
              <p className="text-sm font-medium text-foreground">
                No source added yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Upload a file, paste notes, or use both before continuing.
              </p>
            </div>
          )}

          <label className="mt-5 flex items-start gap-3 rounded-lg bg-warning-background p-4">
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={(event) => setPrivacyAccepted(event.target.checked)}
              className="mt-0.5 size-4 accent-[var(--primary)]"
            />
            <LockKeyhole className="mt-0.5 size-4 shrink-0 text-warning" />
            <span className="text-xs leading-5 text-warning-foreground">
              I understand that meeting notes may contain sensitive information
              and confirm that these sources are appropriate to store in this
              private workspace.
            </span>
          </label>
          {state.fieldErrors.privacy ? (
            <p className="mt-2 text-xs text-destructive">
              {state.fieldErrors.privacy}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Your metadata and source inputs remain on this page if saving fails.
        </p>
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting || !hasSource || projects.length === 0}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" />
              Saving meeting...
            </>
          ) : (
            "Save & Continue to Review"
          )}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  helper,
  error,
  required,
  className,
  children,
}: {
  label: string;
  helper?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </label>
      {helper ? (
        <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
      ) : null}
      <div className="mt-2">{children}</div>
      {error ? (
        <p className="mt-1.5 text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function inferMimeType(fileName: string) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (lower.endsWith(".txt")) return "text/plain";
  return "application/octet-stream";
}
