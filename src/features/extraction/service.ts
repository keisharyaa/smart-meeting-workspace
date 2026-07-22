import type { ExtractionOutput } from "./types";

/**
 * Gemini extraction service.
 *
 * TODO(Keisha):
 * 1. Combine source text in stable source_order.
 * 2. Delimit each source clearly in the prompt.
 * 3. Request structured JSON.
 * 4. Log extraction_runs before and after provider calls.
 * 5. Validate and normalize the provider response.
 * 6. Keep missing PIC/date/time/priority as null.
 * 7. Return Retry and Continue Manually paths on failure.
 * 8. Never publish AI output automatically.
 */
export async function extractMeetingOutcomes(ownerId: string, meetingId: string): Promise<ExtractionOutput> {
  void ownerId; void meetingId;
  throw new Error("TODO: implement extractMeetingOutcomes");
}
