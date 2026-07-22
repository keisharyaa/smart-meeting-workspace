import type { MeetingSourceInput } from "./types";

/**
 * Meeting source validation.
 *
 * A meeting may contain one file, multiple files, pasted text only,
 * or multiple files and pasted text together.
 */
export function validateMeetingSources(sources: MeetingSourceInput[]): void {
  if (sources.length === 0) {
    throw new Error("At least one uploaded file or pasted text source is required.");
  }

  const orders = sources.map((source) => source.sourceOrder);
  if (new Set(orders).size !== orders.length) {
    throw new Error("Meeting source order must be unique.");
  }

  // TODO(Keisha):
  // 1. Enforce MAX_UPLOAD_FILES.
  // 2. Enforce MAX_UPLOAD_SIZE_MB per file.
  // 3. Permit PDF, DOCX, and TXT only.
  // 4. Reject blank pasted text.
  // 5. Enforce MAX_PASTED_TEXT_CHARACTERS.
}
