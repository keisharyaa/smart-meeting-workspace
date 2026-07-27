import { getMaxFileSizeBytes, uploadConfig } from "@/config/upload";

import type {
  MeetingMetadataInput,
  UploadedFileDescriptor,
} from "./types";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class MeetingIntakeValidationError extends Error {
  constructor(
    message: string,
    public readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "MeetingIntakeValidationError";
  }
}

export function validateMeetingMetadata(input: MeetingMetadataInput) {
  const fieldErrors: Record<string, string> = {};

  if (!uuidPattern.test(input.projectId)) {
    fieldErrors.projectId = "Select an active project.";
  }

  if (!input.title.trim()) {
    fieldErrors.title = "Meeting title is required.";
  }

  if (!isValidDate(input.meetingDate)) {
    fieldErrors.meetingDate = "Enter a valid meeting date.";
  }

  if (input.meetingTime && !/^\d{2}:\d{2}$/.test(input.meetingTime)) {
    fieldErrors.meetingTime = "Enter a valid meeting time.";
  }

  if (input.participants.length === 0) {
    fieldErrors.participants = "Add at least one participant.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new MeetingIntakeValidationError(
      "Please correct the highlighted fields.",
      fieldErrors,
    );
  }
}

export function validateFileDescriptors(
  files: Omit<UploadedFileDescriptor, "storagePath">[],
) {
  if (files.length > uploadConfig.maxFiles) {
    throw new MeetingIntakeValidationError(
      `Upload no more than ${uploadConfig.maxFiles} files.`,
      {
        files: `The maximum number of files is ${uploadConfig.maxFiles}.`,
      },
    );
  }

  const maxFileSizeBytes = getMaxFileSizeBytes();
  const sourceOrders = new Set<number>();

  for (const file of files) {
    const extension = getExtension(file.originalFileName);

    if (
      !uploadConfig.allowedMimeTypes.includes(
        file.mimeType as (typeof uploadConfig.allowedMimeTypes)[number],
      ) ||
      !uploadConfig.allowedExtensions.includes(
        extension as (typeof uploadConfig.allowedExtensions)[number],
      )
    ) {
      throw new MeetingIntakeValidationError(
        "One or more files use an unsupported format.",
        {
          files: "Only text-based PDF, DOCX, and TXT files are supported.",
        },
      );
    }

    if (file.fileSizeBytes <= 0) {
      throw new MeetingIntakeValidationError(
        "One or more uploaded files are empty.",
        { files: "Remove empty files before continuing." },
      );
    }

    if (file.fileSizeBytes > maxFileSizeBytes) {
      throw new MeetingIntakeValidationError(
        "One or more files exceed the upload limit.",
        {
          files: `Each file must be ${uploadConfig.maxFileSizeMb} MB or smaller.`,
        },
      );
    }

    if (
      !Number.isInteger(file.sourceOrder) ||
      file.sourceOrder < 0 ||
      sourceOrders.has(file.sourceOrder)
    ) {
      throw new MeetingIntakeValidationError(
        "Meeting source order is invalid.",
        { files: "Remove and re-add the affected file, then try again." },
      );
    }

    sourceOrders.add(file.sourceOrder);
  }
}

export function validatePastedText(text: string | null | undefined) {
  const original = text ?? "";
  const normalized = original.trim();

  if (original.length > uploadConfig.maxPastedTextCharacters) {
    throw new MeetingIntakeValidationError(
      "The pasted notes exceed the character limit.",
      {
        pastedText: `Use no more than ${uploadConfig.maxPastedTextCharacters.toLocaleString()} characters.`,
      },
    );
  }

  return normalized ? original : "";
}

export function requireAtLeastOneSource(
  files: UploadedFileDescriptor[],
  pastedText: string,
) {
  if (files.length === 0 && !pastedText) {
    throw new MeetingIntakeValidationError(
      "At least one meeting source is required.",
      {
        sources: "Upload a supported file, paste meeting notes, or use both.",
      },
    );
  }
}

export function validateSourceOrders(
  files: UploadedFileDescriptor[],
  pastedTextSourceOrder: number | null | undefined,
) {
  const orders = files.map((file) => file.sourceOrder);

  if (pastedTextSourceOrder !== null && pastedTextSourceOrder !== undefined) {
    if (
      !Number.isInteger(pastedTextSourceOrder) ||
      pastedTextSourceOrder < 0
    ) {
      throw new MeetingIntakeValidationError(
        "Pasted-text source order is invalid.",
      );
    }
    orders.push(pastedTextSourceOrder);
  }

  if (new Set(orders).size !== orders.length) {
    throw new MeetingIntakeValidationError(
      "Meeting source order must be unique.",
    );
  }
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
}

function getExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
}
