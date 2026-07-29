import { createClient } from "@/lib/supabase/server";
import type { Json, TablesUpdate } from "@/types/database";

export async function createExtractionRun(input: {
  ownerId: string;
  meetingId: string;
  model: string;
  characterCount: number;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("extraction_runs")
    .insert({
      owner_id: input.ownerId,
      meeting_id: input.meetingId,
      provider: "google",
      model: input.model,
      status: "pending",
      input_character_count: input.characterCount,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw new Error("Unable to start the extraction attempt.");
  return data.id;
}

export async function markExtractionProcessing(
  ownerId: string,
  runId: string,
) {
  await updateRun(ownerId, runId, { status: "processing" });
}

export async function markExtractionSucceeded(input: {
  ownerId: string;
  runId: string;
  output: Json;
  durationMs: number;
  model?: string;
}) {
  await updateRun(input.ownerId, input.runId, {
    status: "success",
    model: input.model,
    normalized_output: input.output,
    duration_ms: input.durationMs,
    completed_at: new Date().toISOString(),
    error_code: null,
    error_message: null,
  });
}

export async function markExtractionFailed(input: {
  ownerId: string;
  runId: string;
  code: string;
  message: string;
  durationMs: number;
  model?: string;
}) {
  await updateRun(input.ownerId, input.runId, {
    status: "failed",
    model: input.model,
    duration_ms: input.durationMs,
    completed_at: new Date().toISOString(),
    error_code: input.code,
    error_message: input.message,
  });
}

async function updateRun(
  ownerId: string,
  runId: string,
  values: TablesUpdate<"extraction_runs">,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("extraction_runs")
    .update(values)
    .eq("id", runId)
    .eq("owner_id", ownerId);

  if (error) throw new Error("Unable to update the extraction attempt.");
}
