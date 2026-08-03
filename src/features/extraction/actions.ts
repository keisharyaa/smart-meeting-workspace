"use server";

import { getCurrentReviewDraft } from "@/features/review-drafts/service";
import { createClient } from "@/lib/supabase/server";

import { extractMeetingOutcomes } from "./service";

export async function processMeetingWithAiAction(meetingId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("AUTH_REQUIRED");

    const result = await extractMeetingOutcomes(user.id, meetingId);
    const draft = await getCurrentReviewDraft(user.id, meetingId);
    return {
      success: true as const,
      message: result.initializedDraft
        ? "Draft generated. Review the content before saving."
        : "A new extraction is ready to review.",
      draft,
      candidate: result.initializedDraft
        ? null
        : { runId: result.runId, output: result.output },
    };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error
          ? error.message
          : JSON.stringify(error)
    };
  }
}
