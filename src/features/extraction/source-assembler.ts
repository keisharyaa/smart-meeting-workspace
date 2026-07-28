import type { Meeting, MeetingSource } from "@/features/meetings/types";

export class SourceAssemblyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SourceAssemblyError";
  }
}

export interface AssembledMeetingSources {
  content: string;
  characterCount: number;
}

export function assembleMeetingSources(
  meeting: Meeting,
  sources: MeetingSource[],
): AssembledMeetingSources {
  if (sources.length === 0) {
    throw new SourceAssemblyError("No readable meeting sources are available.");
  }

  const orderedSources = [...sources].sort(
    (left, right) => left.source_order - right.source_order,
  );
  const sourceBlocks = orderedSources.map((source, index) => {
    const label =
      source.source_type === "file"
        ? source.original_file_name || `Source ${index + 1}`
        : "Pasted meeting notes";

    return [
      `<source index="${index + 1}" id="${escapeAttribute(source.id)}" type="${source.source_type}" label="${escapeAttribute(label)}">`,
      source.raw_text,
      "</source>",
    ].join("\n");
  });

  const content = [
    "<meeting_context>",
    `Title: ${meeting.title}`,
    `Date: ${meeting.meeting_date}`,
    `Participants: ${meeting.participants.join(", ")}`,
    "</meeting_context>",
    "",
    "<meeting_sources>",
    sourceBlocks.join("\n\n"),
    "</meeting_sources>",
  ].join("\n");

  const configuredMaximum = Number(
    process.env.GEMINI_MAX_INPUT_CHARACTERS ?? "500000",
  );
  const maximum =
    Number.isFinite(configuredMaximum) && configuredMaximum > 0
      ? configuredMaximum
      : 500_000;

  if (content.length > maximum) {
    throw new SourceAssemblyError(
      "The combined meeting notes are too large for AI processing. Continue manually instead.",
    );
  }

  return { content, characterCount: content.length };
}

function escapeAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
