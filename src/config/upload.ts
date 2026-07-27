const DEFAULT_MAX_UPLOAD_SIZE_MB = 10;
const DEFAULT_MAX_UPLOAD_FILES = 5;
const DEFAULT_MAX_PASTED_TEXT_CHARACTERS = 100_000;

function readPositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const uploadConfig = {
  bucket: "meeting-files",
  maxFileSizeMb: readPositiveInteger(
    process.env.MAX_UPLOAD_SIZE_MB,
    DEFAULT_MAX_UPLOAD_SIZE_MB,
  ),
  maxFiles: readPositiveInteger(
    process.env.MAX_UPLOAD_FILES,
    DEFAULT_MAX_UPLOAD_FILES,
  ),
  maxPastedTextCharacters: readPositiveInteger(
    process.env.MAX_PASTED_TEXT_CHARACTERS,
    DEFAULT_MAX_PASTED_TEXT_CHARACTERS,
  ),
  allowedMimeTypes: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ] as const,
  allowedExtensions: [".pdf", ".docx", ".txt"] as const,
} as const;

export function getMaxFileSizeBytes() {
  return uploadConfig.maxFileSizeMb * 1024 * 1024;
}
