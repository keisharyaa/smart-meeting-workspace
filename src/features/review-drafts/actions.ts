"use server";

import { z } from "zod";

import { extractionResultSchema } from "@/features/extraction/schema";
import { getOwnedMeetingDraft } from "@/features/meetings/repository";
import { createClient } from "@/lib/supabase/server";

import {
  createManualReview,
  publishCurrentReview,
  replaceReviewWithExtraction,
  saveCurrentReview,
} from "./service";
import type { ReviewDraft, SaveReviewDraftInput } from "./types";

export interface ReviewActionResult {
  success: boolean;
  message: string;
  draft?: ReviewDraft;
  conflict?: boolean;
  meetingPath?: string;
}

const saveSchema = z.object({
  draftId: z.string().uuid(),
  expectedVersion: z.number().int().positive(),
  processingMethod: z.enum(["ai", "manual"]),
  sourceExtractionRunId: z.string().uuid().nullable(),
  summary: z.string().max(20_000),
  outcomes: z.array(
    z.object({
      outcomeType: z.enum(["decision", "blocker", "unresolved_question"]),
      content: z.string().max(10_000),
      sourceReference: z.string().max(2_000).nullable(),
      displayOrder: z.number().int().nonnegative(),
    }),
  ),
  actionItems: z.array(
    z.object({
      projectId: z.string().uuid(),
      meetingId: z.string().uuid(),
      title: z.string().trim().min(1, "Action item title is required.").max(500),
      description: z.string().max(10_000).nullable(),
      picName: z.string().max(500).nullable(),
      picEmail: z.union([z.string().email(), z.literal(""), z.null()]),
      picRole: z.string().max(500).nullable(),
      dueDate: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.null()]),
      dueTime: z.union([z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), z.null()]),
      priority: z.enum(["low", "medium", "high"]).nullable(),
      clarificationStatus: z.enum(["clear", "needs_clarification"]),
      sourceReference: z.string().max(2_000).nullable(),
      displayOrder: z.number().int().nonnegative(),
    }).refine((item) => !item.dueTime || Boolean(item.dueDate), {
      path: ["dueTime"],
      message: "Add a deadline date before adding a time.",
    }),
  ),
});

export async function continueManuallyAction(
  meetingId: string,
): Promise<ReviewActionResult> {
  try {
    const { ownerId, meeting } = await requireOwnedMeeting(meetingId);
    const draft = await createManualReview(ownerId, meeting);
    return { success: true, message: "Manual review is ready.", draft };
  } catch {
    return {
      success: false,
      message: "Manual review could not be started. Your Original Meeting Notes remain unchanged.",
    };
  }
}

export async function saveReviewDraftAction(
  meetingId: string,
  input: SaveReviewDraftInput,
): Promise<ReviewActionResult> {
  try {
    const parsed = saveSchema.parse(input);
    const { ownerId, meeting } = await requireOwnedMeeting(meetingId);
    const draft = await saveCurrentReview(ownerId, meeting, parsed);
    return { success: true, message: "Draft saved.", draft };
  } catch (error) {
    if (error instanceof Error && error.message === "VERSION_CONFLICT") {
      return {
        success: false,
        conflict: true,
        message: "This draft changed in another session. Reload before saving again.",
      };
    }
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.issues[0]?.message ?? "Review the highlighted draft fields.",
      };
    }
    return {
      success: false,
      message: "The draft could not be saved. Your unsaved changes remain on this page.",
    };
  }
}

export async function acceptExtractionCandidateAction(input: {
  meetingId: string;
  runId: string;
  expectedVersion: number;
  output: unknown;
}): Promise<ReviewActionResult> {
  try {
    const output = extractionResultSchema.parse(input.output);
    const { ownerId, meeting } = await requireOwnedMeeting(input.meetingId);
    const supabase = await createClient();
    const { data: run } = await supabase
      .from("extraction_runs")
      .select("id")
      .eq("id", input.runId)
      .eq("owner_id", ownerId)
      .eq("meeting_id", meeting.id)
      .eq("status", "success")
      .maybeSingle();
    if (!run) throw new Error("EXTRACTION_RUN_NOT_FOUND");
    const draft = await replaceReviewWithExtraction(
      ownerId,
      meeting,
      input.runId,
      input.expectedVersion,
      output,
    );
    return { success: true, message: "The new AI-generated draft is ready.", draft };
  } catch {
    return {
      success: false,
      message: "The new extraction could not replace the saved draft.",
    };
  }
}

export async function approveAndPublishReviewAction(
  meetingId: string,
  input: SaveReviewDraftInput,
): Promise<ReviewActionResult> {
  try {
    const parsed = saveSchema.parse(input);
    const { ownerId, meeting } = await requireOwnedMeeting(meetingId);
    await saveCurrentReview(ownerId, meeting, parsed);
    await publishCurrentReview(ownerId, meeting.id);

    return {
      success: true,
      message: "Meeting published successfully.",
      meetingPath: `/meetings/${meeting.id}`,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "VERSION_CONFLICT") {
      return {
        success: false,
        conflict: true,
        message: "This draft changed in another session. Reload before publishing again.",
      };
    }
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.issues[0]?.message ?? "Review the highlighted draft fields before publishing.",
      };
    }
    return {
      success: false,
      message: "The meeting could not be published. Your draft remains available for review.",
    };
  }
}

async function requireOwnedMeeting(meetingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("AUTH_REQUIRED");

  const meeting = await getOwnedMeetingDraft(user.id, meetingId);
  if (!meeting) throw new Error("MEETING_NOT_FOUND");
  return { ownerId: user.id, meeting };
}
