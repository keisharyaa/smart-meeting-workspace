import { uploadConfig } from "@/config/upload";
import { createClient } from "@/lib/supabase/server";

import { extractTextFromFile } from "./parser";
import {
  deleteMeetingDraft,
  getActiveProject,
  getOwnedMeetingDraft,
  insertMeetingDraft,
  insertMeetingSources,
} from "./repository";
import {
  requireAtLeastOneSource,
  validateFileDescriptors,
  validateMeetingMetadata,
  validatePastedText,
  validateSourceOrders,
} from "./rules";
import type {
  CreateMeetingUploadPlan,
  FinalizeMeetingInput,
  MeetingDraftWithSources,
  MeetingMetadataInput,
  SignedUploadDescriptor,
} from "./types";

export async function prepareMeetingDraft(
  ownerId: string,
  metadata: MeetingMetadataInput,
  files: Array<{
    originalFileName: string;
    mimeType: string;
    fileSizeBytes: number;
    sourceOrder: number;
  }>,
): Promise<CreateMeetingUploadPlan> {
  validateMeetingMetadata(metadata);
  validateFileDescriptors(files);

  const project = await getActiveProject(ownerId, metadata.projectId);
  if (!project) {
    throw new Error(
      "The selected project is no longer active. Choose another project.",
    );
  }

  const meeting = await insertMeetingDraft(ownerId, {
    ...metadata,
    title: metadata.title.trim(),
    participants: metadata.participants.map((item) => item.trim()).filter(Boolean),
  });

  const supabase = await createClient();
  const uploads: SignedUploadDescriptor[] = [];

  try {
    for (const file of files) {
      const storagePath = buildStoragePath(
        ownerId,
        meeting.id,
        file.originalFileName,
        file.sourceOrder,
      );

      const { data, error } = await supabase.storage
        .from(uploadConfig.bucket)
        .createSignedUploadUrl(storagePath);

      if (error || !data) {
        throw new Error("Unable to prepare a secure file upload.");
      }

      uploads.push({
        ...file,
        storagePath,
        token: data.token,
      });
    }

    return { meetingId: meeting.id, uploads };
  } catch (error) {
    await deleteMeetingDraft(ownerId, meeting.id);
    throw error;
  }
}

export async function finalizeMeetingDraft(
  ownerId: string,
  input: FinalizeMeetingInput,
): Promise<MeetingDraftWithSources> {
  const meeting = await getOwnedMeetingDraft(ownerId, input.meetingId);
  if (!meeting) {
    throw new Error("This meeting draft is no longer available.");
  }

    validateFileDescriptors(
    input.uploadedFiles.map((file) => ({
      originalFileName: file.originalFileName,
      mimeType: file.mimeType,
      fileSizeBytes: file.fileSizeBytes,
      sourceOrder: file.sourceOrder,
    })),
  ); 
  
  const pastedText = validatePastedText(input.pastedText);
  requireAtLeastOneSource(input.uploadedFiles, pastedText);
  validateSourceOrders(input.uploadedFiles, input.pastedTextSourceOrder);

  const supabase = await createClient();
  const sourceRows: Parameters<typeof insertMeetingSources>[0] = [];

  try {
    for (const file of input.uploadedFiles) {
      if (!file.storagePath.startsWith(`${ownerId}/${meeting.id}/`)) {
        throw new Error("An uploaded file path is invalid.");
      }

      const { data, error } = await supabase.storage
        .from(uploadConfig.bucket)
        .download(file.storagePath);

      if (error || !data) {
        throw new Error(`Unable to retrieve ${file.originalFileName}.`);
      }

      const rawText = await extractTextFromFile(
        Buffer.from(await data.arrayBuffer()),
        file.mimeType,
      );

      sourceRows.push({
        owner_id: ownerId,
        meeting_id: meeting.id,
        source_type: "file",
        original_file_name: file.originalFileName,
        mime_type: file.mimeType,
        file_size_bytes: file.fileSizeBytes,
        storage_path: file.storagePath,
        raw_text: rawText,
        source_order: file.sourceOrder,
      });
    }

    if (pastedText) {
      sourceRows.push({
        owner_id: ownerId,
        meeting_id: meeting.id,
        source_type: "pasted_text",
        original_file_name: null,
        mime_type: "text/plain",
        file_size_bytes: Buffer.byteLength(pastedText, "utf8"),
        storage_path: null,
        raw_text: pastedText,
        source_order:
          input.pastedTextSourceOrder ??
          Math.max(-1, ...input.uploadedFiles.map((file) => file.sourceOrder)) + 1,
      });
    }

    sourceRows.sort((a, b) => a.source_order - b.source_order);
    const sources = await insertMeetingSources(sourceRows);
    return { meeting, sources };
  } catch (error) {
    await removeStoredFiles(input.uploadedFiles.map((file) => file.storagePath));
    await deleteMeetingDraft(ownerId, meeting.id);
    throw error;
  }
}

export async function cancelMeetingDraft(
  ownerId: string,
  meetingId: string,
  storagePaths: string[],
): Promise<void> {
  const safePaths = storagePaths.filter((path) =>
    path.startsWith(`${ownerId}/${meetingId}/`),
  );
  await removeStoredFiles(safePaths);
  await deleteMeetingDraft(ownerId, meetingId);
}

async function removeStoredFiles(paths: string[]) {
  if (paths.length === 0) return;

  try {
    const supabase = await createClient();
    const { error } = await supabase.storage
      .from(uploadConfig.bucket)
      .remove(paths);

    if (error) {
      console.error("Unable to clean up meeting files:", error);
    }
  } catch (error) {
    console.error("Unable to clean up meeting files:", error);
  }
}

function buildStoragePath(
  ownerId: string,
  meetingId: string,
  originalFileName: string,
  sourceOrder: number,
) {
  const extensionIndex = originalFileName.lastIndexOf(".");
  const extension =
    extensionIndex >= 0
      ? originalFileName.slice(extensionIndex).toLowerCase()
      : "";
  const baseName = (extensionIndex >= 0
    ? originalFileName.slice(0, extensionIndex)
    : originalFileName
  )
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  const uniquePart = crypto.randomUUID();
  return `${ownerId}/${meetingId}/${sourceOrder}-${uniquePart}-${baseName || "meeting-notes"}${extension}`;
}
