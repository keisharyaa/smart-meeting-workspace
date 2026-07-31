"use client";

import { Loader2, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ConfirmationDialog } from "@/components/feedback/confirmation-dialog";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { processMeetingWithAiAction } from "@/features/extraction/actions";
import type { ExtractionOutput } from "@/features/extraction/types";
import type { Meeting, MeetingSource } from "@/features/meetings/types";
import {
  acceptExtractionCandidateAction,
  continueManuallyAction,
  saveReviewDraftAction,
} from "@/features/review-drafts/actions";
import type {
  ReviewActionItem,
  ReviewDraft,
  ReviewOutcome,
} from "@/features/review-drafts/types";

import { DraftActionItemsEditor } from "./draft-action-items-editor";
import { OriginalNotesPanel } from "./original-notes-panel";
import { ProcessingMethodSelector } from "./processing-method-selector";
import { ReviewOutcomesEditor } from "./review-outcomes-editor";

type Candidate = { runId: string; output: ExtractionOutput };

export function HumanReviewWorkspace({
  meeting,
  sources,
  projectName,
  initialDraft,
}: {
  meeting: Meeting;
  sources: MeetingSource[];
  projectName: string;
  initialDraft: ReviewDraft | null;
}) {
  const [draft, setDraft] = useState(initialDraft);
  const [summary, setSummary] = useState(initialDraft?.summary ?? "");
  const [outcomes, setOutcomes] = useState<ReviewOutcome[]>(initialDraft?.outcomes ?? []);
  const [actions, setActions] = useState<ReviewActionItem[]>(initialDraft?.actionItems ?? []);
  const [expandedActionId, setExpandedActionId] = useState<string | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ variant: "info" | "success" | "warning" | "destructive"; text: string } | null>(null);
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  const method = draft?.processingMethod ?? null;
  const statusBadges = useMemo(
    () => (
      <div className="flex flex-wrap items-center gap-2" aria-label="Draft status">
        <Badge variant="secondary">Draft</Badge>
        {method === "ai" ? <Badge>AI Generated</Badge> : null}
        {method === "manual" ? <Badge variant="outline">Manual</Badge> : null}
        {dirty ? <Badge variant="warning">User Edited</Badge> : null}
      </div>
    ),
    [dirty, method],
  );

  function applyDraft(next: ReviewDraft) {
    setDraft(next);
    setSummary(next.summary);
    setOutcomes(next.outcomes);
    setActions(next.actionItems);
    setDirty(false);
    setActionErrors({});
  }

  async function processWithAi() {
    setProcessing(true);
    setMessage({ variant: "info", text: "Processing meeting notes..." });
    const result = await processMeetingWithAiAction(meeting.id);
    setProcessing(false);
    if (!result.success) {
      setMessage({ variant: "destructive", text: result.message });
      return;
    }
    if (result.draft && !result.candidate) applyDraft(result.draft);
    if (result.candidate) setCandidate(result.candidate);
    setMessage({
      variant: result.candidate ? "warning" : "success",
      text: result.message,
    });
  }

  async function continueManually() {
    const result = await continueManuallyAction(meeting.id);
    if (!result.success || !result.draft) {
      setMessage({ variant: "destructive", text: result.message });
      return;
    }
    applyDraft(result.draft);
    setMessage({ variant: "success", text: result.message });
  }

  async function acceptCandidate() {
    if (!candidate || !draft) return;
    const result = await acceptExtractionCandidateAction({
      meetingId: meeting.id,
      runId: candidate.runId,
      expectedVersion: draft.version,
      output: candidate.output,
    });
    if (!result.success || !result.draft) {
      setMessage({ variant: "destructive", text: result.message });
      return;
    }
    applyDraft(result.draft);
    setCandidate(null);
    setMessage({ variant: "success", text: result.message });
  }

  async function saveDraft() {
    if (!draft) return;
    const errors = Object.fromEntries(
      actions
        .filter((item) => !item.title.trim())
        .map((item) => [item.id, "Action item title is required."]),
    );
    setActionErrors(errors);
    if (Object.keys(errors).length > 0) {
      setMessage({ variant: "destructive", text: "Add a title to every draft action item before saving." });
      setExpandedActionId(Object.keys(errors)[0]);
      return;
    }

    setSaving(true);
    setMessage(null);
    const result = await saveReviewDraftAction(meeting.id, {
      draftId: draft.id,
      expectedVersion: draft.version,
      processingMethod: draft.processingMethod,
      sourceExtractionRunId: draft.sourceExtractionRunId,
      summary,
      outcomes: outcomes.map((outcome, index) => ({
        outcomeType: outcome.outcomeType,
        content: outcome.content,
        sourceReference: outcome.sourceReference,
        displayOrder: index,
      })),
      actionItems: actions.map((action, index) => ({
        projectId: action.projectId,
        meetingId: action.meetingId,
        title: action.title,
        description: action.description,
        picName: action.picName,
        picEmail: action.picEmail,
        picRole: action.picRole,
        dueDate: action.dueDate,
        dueTime: action.dueTime,
        priority: action.priority,
        clarificationStatus: action.clarificationStatus,
        sourceReference: action.sourceReference,
        displayOrder: index,
      })),
    });
    setSaving(false);
    if (!result.success || !result.draft) {
      setMessage({ variant: result.conflict ? "warning" : "destructive", text: result.message });
      return;
    }
    applyDraft(result.draft);
    setMessage({ variant: "success", text: result.message });
  }

  const editorDisabled = !draft || saving;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="grid gap-4 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <Context label="Meeting" value={meeting.title} />
          <Context label="Project" value={projectName} />
          <Context label="Date" value={meeting.meeting_date} />
          <Context label="Participants" value={meeting.participants.join(", ")} />
          <div className="sm:col-span-2 lg:col-span-4">{statusBadges}</div>
        </CardContent>
      </Card>

      <OriginalNotesPanel sources={sources} />

      <ProcessingMethodSelector
        selected={method}
        processing={processing}
        onAi={processWithAi}
        onManual={continueManually}
      />

      {message ? (
        <Alert
          variant={message.variant}
          role={message.variant === "destructive" ? "alert" : "status"}
          aria-live="polite"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{message.text}</span>
            {message.variant === "destructive" ? (
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={processWithAi} disabled={processing}>
                  Retry Extraction
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={continueManually} disabled={processing}>
                  Continue Manually
                </Button>
              </div>
            ) : null}
          </div>
        </Alert>
      ) : null}

      {candidate && draft ? (
        <Alert variant="warning">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>A new extraction is ready. Your saved draft has not been replaced.</span>
            <ConfirmationDialog
              title="Use the new extraction?"
              description="This replaces the current editable draft with the new AI-generated content. Original Meeting Notes remain unchanged."
              confirmLabel="Use New Extraction"
              onConfirm={acceptCandidate}
              trigger={<Button type="button" size="sm">Use New Extraction</Button>}
            />
          </div>
        </Alert>
      ) : null}

      <ReviewOutcomesEditor
        summary={summary}
        outcomes={outcomes}
        disabled={editorDisabled}
        onSummaryChange={(value) => { setSummary(value); setDirty(true); }}
        onOutcomesChange={(value) => { setOutcomes(value); setDirty(true); }}
      />

      <DraftActionItemsEditor
        items={actions}
        expandedId={expandedActionId}
        projectId={meeting.project_id}
        projectName={projectName}
        meetingId={meeting.id}
        meetingTitle={meeting.title}
        disabled={editorDisabled}
        errors={actionErrors}
        onItemsChange={(value) => { setActions(value); setDirty(true); }}
        onExpandedChange={setExpandedActionId}
      />

      <Card className="sticky bottom-4 z-20">
        <CardFooter className="flex-col gap-3 bg-card/95 sm:flex-row sm:justify-between">
          <div aria-live="polite">
            {dirty ? <span className="text-sm text-warning-foreground">Unsaved changes</span> : <span className="text-helper">{draft ? "Draft progress is saved." : "Select a processing method to begin."}</span>}
          </div>
          <Button className="w-full sm:w-auto" size="lg" disabled={!draft || saving || !dirty} onClick={saveDraft}>
            {saving ? <Loader2 className="animate-spin" /> : <Save />}
            {saving ? "Saving draft..." : "Save Draft"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function Context({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-caption text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value || "Not provided"}</p>
    </div>
  );
}
