export type ProcessingMethod = "ai" | "manual";
export type ClarificationStatus = "clear" | "needs_clarification";
export type OutcomeType = "decision" | "blocker" | "unresolved_question";

export interface ReviewOutcome {
  id: string;
  outcomeType: OutcomeType;
  content: string;
  sourceReference: string | null;
  displayOrder: number;
}

export interface ReviewActionItem {
  id: string;
  projectId: string;
  meetingId: string;
  title: string;
  description: string | null;
  picName: string | null;
  picEmail: string | null;
  dueDate: string | null;
  dueTime: string | null;
  priority: "low" | "medium" | "high" | null;
  clarificationStatus: ClarificationStatus;
  sourceReference: string | null;
  displayOrder: number;
}

export interface ReviewDraft {
  id: string;
  meetingId: string;
  processingMethod: ProcessingMethod;
  sourceExtractionRunId: string | null;
  summary: string;
  version: number;
  outcomes: ReviewOutcome[];
  actionItems: ReviewActionItem[];
}

export interface SaveReviewDraftInput {
  draftId: string;
  expectedVersion: number;
  processingMethod: ProcessingMethod;
  sourceExtractionRunId: string | null;
  summary: string;
  outcomes: Omit<ReviewOutcome, "id">[];
  actionItems: Omit<ReviewActionItem, "id">[];
}
