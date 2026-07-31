import { createClient } from "@/lib/supabase/server";

import type {
  ProcessingMethod,
  ReviewActionItem,
  ReviewDraft,
  ReviewOutcome,
  SaveReviewDraftInput,
} from "./types";

export async function getReviewDraft(
  ownerId: string,
  meetingId: string,
): Promise<ReviewDraft | null> {
  const supabase = await createClient();
  const { data: draft, error } = await supabase
    .from("meeting_review_drafts")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("meeting_id", meetingId)
    .maybeSingle();

  if (error) throw new Error("Unable to load the review draft.");
  if (!draft) return null;

  const [{ data: outcomes, error: outcomesError }, { data: actions, error: actionsError }] =
    await Promise.all([
      supabase
        .from("meeting_review_outcomes")
        .select("*")
        .eq("owner_id", ownerId)
        .eq("review_draft_id", draft.id)
        .order("outcome_type")
        .order("display_order"),
      supabase
        .from("meeting_review_action_items")
        .select("*")
        .eq("owner_id", ownerId)
        .eq("review_draft_id", draft.id)
        .order("display_order"),
    ]);

  if (outcomesError || actionsError) {
    throw new Error("Unable to load the saved review content.");
  }

  return {
    id: draft.id,
    meetingId: draft.meeting_id,
    processingMethod: draft.processing_method as ProcessingMethod,
    sourceExtractionRunId: draft.source_extraction_run_id,
    summary: draft.summary,
    version: draft.version,
    outcomes: (outcomes ?? []).map(mapOutcome),
    actionItems: (actions ?? []).map(mapAction),
  };
}

export async function createReviewDraft(input: {
  ownerId: string;
  meetingId: string;
  method: ProcessingMethod;
  extractionRunId?: string | null;
  summary?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meeting_review_drafts")
    .insert({
      owner_id: input.ownerId,
      meeting_id: input.meetingId,
      processing_method: input.method,
      source_extraction_run_id: input.extractionRunId ?? null,
      summary: input.summary ?? "",
    })
    .select("id")
    .single();

  if (error) throw new Error("Unable to initialize the review draft.");
  return data.id;
}

export async function initializeReviewDraft(input: {
  meetingId: string;
  method: ProcessingMethod;
  extractionRunId: string;
  summary: string;
  outcomes: SaveReviewDraftInput["outcomes"];
  actionItems: SaveReviewDraftInput["actionItems"];
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("initialize_meeting_review_draft", {
    target_meeting_id: input.meetingId,
    draft_method: input.method,
    extraction_run_id: input.extractionRunId,
    draft_summary: input.summary,
    draft_outcomes: input.outcomes,
    draft_actions: input.actionItems,
  });

  if (error) throw new Error("Unable to initialize the AI review draft.");
  return data;
}

export async function saveReviewDraft(
  ownerId: string,
  input: SaveReviewDraftInput,
) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("save_meeting_review_draft", {
    draft_id: input.draftId,
    expected_version: input.expectedVersion,
    draft_summary: input.summary,
    draft_method: input.processingMethod,
    draft_outcomes: input.outcomes,
    draft_actions: input.actionItems,
    extraction_run_id: input.sourceExtractionRunId,
  });

  if (error) {
    if (error.message.includes("review_draft_version_conflict")) {
      throw new Error("VERSION_CONFLICT");
    }
    throw new Error("Unable to save the review draft.");
  }

  // Owner is enforced by the security-invoker function and RLS.
  void ownerId;
  return data;
}

function mapOutcome(row: {
  id: string;
  outcome_type: string;
  content: string;
  source_reference: string | null;
  display_order: number;
}): ReviewOutcome {
  return {
    id: row.id,
    outcomeType: row.outcome_type as ReviewOutcome["outcomeType"],
    content: row.content,
    sourceReference: row.source_reference,
    displayOrder: row.display_order,
  };
}

function mapAction(row: {
  id: string;
  project_id: string;
  meeting_id: string;
  title: string;
  description: string | null;
  pic_name: string | null;
  pic_email: string | null;
  pic_role: string | null;
  due_date: string | null;
  due_time: string | null;
  priority: "low" | "medium" | "high" | null;
  clarification_status: string;
  source_reference: string | null;
  display_order: number;
}): ReviewActionItem {
  return {
    id: row.id,
    projectId: row.project_id,
    meetingId: row.meeting_id,
    title: row.title,
    description: row.description,
    picName: row.pic_name,
    picEmail: row.pic_email,
    picRole: row.pic_role,
    dueDate: row.due_date,
    dueTime: row.due_time?.slice(0, 5) ?? null,
    priority: row.priority,
    clarificationStatus:
      row.clarification_status as ReviewActionItem["clarificationStatus"],
    sourceReference: row.source_reference,
    displayOrder: row.display_order,
  };
}
