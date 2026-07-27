import mammoth from "mammoth";

export class DocumentParsingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentParsingError";
  }
}

export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  try {
    if (mimeType === "text/plain") {
      return requireReadableText(buffer.toString("utf8"));
    }

    if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer });

      return requireReadableText(result.value);
    }

    if (mimeType === "application/pdf") {
      const [{ PDFParse }, { CanvasFactory }] = await Promise.all([
        import("pdf-parse"),
        import("pdf-parse/worker"),
      ]);

      const parser = new PDFParse({
        data: buffer,
        CanvasFactory,
      });

      try {
        const result = await parser.getText();

        return requireReadableText(result.text);
      } finally {
        await parser.destroy();
      }
    }

    throw new DocumentParsingError(
      "This file type is not supported.",
    );
  } catch (error) {
    if (error instanceof DocumentParsingError) {
      throw error;
    }

    console.error("Document parsing failed:", error);

    throw new DocumentParsingError(
      "The file could not be read. Use a text-based PDF, DOCX, or TXT file, or paste the notes instead.",
    );
  }
}

function requireReadableText(value: string): string {
  const normalized = value.replace(/\u0000/g, "").trim();

  if (!normalized) {
    throw new DocumentParsingError(
      "No readable text was found. Scanned, image-only, empty, and password-protected files are unsupported.",
    );
  }

  return normalized;
}