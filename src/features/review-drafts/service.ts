import type { Meeting } from "@/features/meetings/types";
import type { ValidatedExtractionResult } from "@/features/extraction/schema";

import {
  createReviewDraft,
  getReviewDraft,
  initializeReviewDraft,
  saveReviewDraft,
} from "./repository";
import type {
  ReviewActionItem,
  ReviewDraft,
  ReviewOutcome,
  SaveReviewDraftInput,
} from "./types";

export function getCurrentReviewDraft(ownerId: string, meetingId: string) {
  return getReviewDraft(ownerId, meetingId);
}

export async function createManualReview(
  ownerId: string,
  meeting: Meeting,
): Promise<ReviewDraft> {
  const existing = await getReviewDraft(ownerId, meeting.id);
  if (existing) return existing;

  await createReviewDraft({
    ownerId,
    meetingId: meeting.id,
    method: "manual",
  });
  const created = await getReviewDraft(ownerId, meeting.id);
  if (!created) throw new Error("Unable to initialize the manual review.");
  return created;
}

export async function createReviewFromExtraction(
  ownerId: string,
  meeting: Meeting,
  runId: string,
  output: ValidatedExtractionResult,
): Promise<ReviewDraft> {
  const existing = await getReviewDraft(ownerId, meeting.id);
  if (existing) return existing;

  await initializeReviewDraft({
    meetingId: meeting.id,
    method: "ai",
    extractionRunId: runId,
    summary: output.summary,
    outcomes: extractionOutcomes(output),
    actionItems: extractionActions(meeting, output),
  });

  const created = await getReviewDraft(ownerId, meeting.id);
  if (!created) throw new Error("Unable to initialize the AI review draft.");
  return created;
}

export async function replaceReviewWithExtraction(
  ownerId: string,
  meeting: Meeting,
  runId: string,
  expectedVersion: number,
  output: ValidatedExtractionResult,
) {
  const draft = await getReviewDraft(ownerId, meeting.id);
  if (!draft) {
    return createReviewFromExtraction(ownerId, meeting, runId, output);
  }

  await saveReviewDraft(ownerId, {
    draftId: draft.id,
    expectedVersion,
    processingMethod: "ai",
    sourceExtractionRunId: runId,
    summary: output.summary,
    outcomes: extractionOutcomes(output),
    actionItems: extractionActions(meeting, output),
  });

  const saved = await getReviewDraft(ownerId, meeting.id);
  if (!saved) throw new Error("Unable to load the replaced review draft.");
  return saved;
}

export async function saveCurrentReview(
  ownerId: string,
  meeting: Meeting,
  input: SaveReviewDraftInput,
) {
  const normalized: SaveReviewDraftInput = {
    ...input,
    summary: input.summary.trim(),
    outcomes: input.outcomes
      .map((outcome, index) => ({
        ...outcome,
        content: outcome.content.trim(),
        sourceReference: normalizeNullable(outcome.sourceReference),
        displayOrder: index,
      }))
      .filter((outcome) => outcome.content.length > 0),
    actionItems: input.actionItems.map((action, index) => ({
      ...action,
      meetingId: meeting.id,
      projectId: meeting.project_id,
      title: action.title.trim(),
      description: normalizeNullable(action.description),
      picName: normalizeNullable(action.picName),
      picEmail: normalizeNullable(action.picEmail),
      dueTime: action.dueDate ? action.dueTime : null,
      sourceReference: normalizeNullable(action.sourceReference),
      displayOrder: index,
    })),
  };

  await saveReviewDraft(ownerId, normalized);
  const saved = await getReviewDraft(ownerId, meeting.id);
  if (!saved) throw new Error("Unable to reload the saved review draft.");
  return saved;
}

function extractionOutcomes(
  output: ValidatedExtractionResult,
): Omit<ReviewOutcome, "id">[] {
  return [
    ...output.decisions.map((item, index) => ({
      outcomeType: "decision" as const,
      ...item,
      displayOrder: index,
    })),
    ...output.blockers.map((item, index) => ({
      outcomeType: "blocker" as const,
      ...item,
      displayOrder: index,
    })),
    ...output.unresolvedQuestions.map((item, index) => ({
      outcomeType: "unresolved_question" as const,
      ...item,
      displayOrder: index,
    })),
  ];
}

function extractionActions(
  meeting: Meeting,
  output: ValidatedExtractionResult,
): Omit<ReviewActionItem, "id">[] {
  return output.actionItems.map((item, index) => ({
    projectId: meeting.project_id,
    meetingId: meeting.id,
    ...item,
    displayOrder: index,
  }));
}

function normalizeNullable(value: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
