import type { Json } from "@/types/database";

import { getOwnedMeetingDraft } from "@/features/meetings/repository";
import { createClient } from "@/lib/supabase/server";
import {
  createReviewFromExtraction,
  getCurrentReviewDraft,
} from "@/features/review-drafts/service";

import {
  GeminiConfigurationError,
  generateExtraction,
  getConfiguredGeminiModel,
} from "./gemini-client";
import { normalizeExtractionResult } from "./normalizer";
import {
  createExtractionRun,
  markExtractionFailed,
  markExtractionProcessing,
  markExtractionSucceeded,
} from "./repository";
import { extractionResultSchema } from "./schema";
import { assembleMeetingSources } from "./source-assembler";
import type { ExtractionOutput } from "./types";

export interface ExtractionServiceResult {
  output: ExtractionOutput;
  runId: string;
  initializedDraft: boolean;
}

export async function extractMeetingOutcomes(
  ownerId: string,
  meetingId: string,
): Promise<ExtractionServiceResult> {
  const meeting = await getOwnedMeetingDraft(ownerId, meetingId);
  if (!meeting) {
    throw new Error("This meeting draft is no longer available.");
  }

  const supabase = await createClient();
  const { data: sources, error } = await supabase
    .from("meeting_sources")
    .select("*")
    .eq("meeting_id", meetingId)
    .eq("owner_id", ownerId)
    .order("source_order");

  if (error) throw new Error("Unable to load the Original Meeting Notes.");

  const assembled = assembleMeetingSources(meeting, sources ?? []);
  const requestedModel = getConfiguredGeminiModel();
  const startedAt = Date.now();
  const runId = await createExtractionRun({
    ownerId,
    meetingId,
    model: requestedModel,
    characterCount: assembled.characterCount,
  });

  try {
    await markExtractionProcessing(ownerId, runId);
    const providerResult = await generateExtraction(assembled.content);
    const providerOutput = providerResult.output;
    const validated = extractionResultSchema.parse(providerOutput);
    const output = normalizeExtractionResult(validated);

    await markExtractionSucceeded({
      ownerId,
      runId,
      model: providerResult.model,
      output: output as unknown as Json,
      durationMs: Date.now() - startedAt,
    });

    const existingDraft = await getCurrentReviewDraft(ownerId, meetingId);
    if (!existingDraft) {
      await createReviewFromExtraction(ownerId, meeting, runId, output);
    }

    return {
      output,
      runId,
      initializedDraft: !existingDraft,
    };
  } catch (error) {
    console.error("AI extraction failed:", error);
    const safeMessage = getSafeExtractionMessage(error);
    try {
      await markExtractionFailed({
        ownerId,
        runId,
        code: getFailureCode(error),
        message: safeMessage,
        durationMs: Date.now() - startedAt,
        model: requestedModel,
      });
    } catch (loggingError) {
      console.error("Unable to record extraction failure:", loggingError);
    }
    throw new Error(safeMessage);
  }
}

function getFailureCode(error: unknown) {
  if (error instanceof GeminiConfigurationError) {
    return "provider_not_configured";
  }
  if (error instanceof Error && error.name === "ZodError") {
    return "invalid_structured_output";
  }
  return "provider_failure";
}

function getSafeExtractionMessage(error: unknown) {
  if (error instanceof GeminiConfigurationError) {
    return error.message;
  }

  if (error instanceof Error && error.name === "ZodError") {
    return "The AI response format was invalid. Try again or continue manually.";
  }

  return "AI processing could not be completed. Your Original Meeting Notes and saved draft remain unchanged.";
}
