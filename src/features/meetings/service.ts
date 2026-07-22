import type { CreateMeetingInput, Meeting } from "./types";

/**
 * Meeting intake orchestration.
 *
 * TODO(Keisha):
 * 1. Validate metadata and all sources.
 * 2. Confirm the selected project is Active.
 * 3. Upload every file to the private meeting-files bucket.
 * 4. Parse each supported file.
 * 5. Store every source in a separate meeting_sources row.
 * 6. Preserve source_order.
 * 7. Preserve valid input when a later step fails.
 * 8. Redirect to Human Review only after persistence succeeds.
 */
export async function createMeetingDraft(ownerId: string, input: CreateMeetingInput): Promise<Meeting> {
  void ownerId; void input;
  throw new Error("TODO: implement createMeetingDraft");
}
