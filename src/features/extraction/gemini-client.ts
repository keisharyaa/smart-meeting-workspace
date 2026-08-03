import "server-only";

import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

import { extractionProviderSchema } from "./schema";
import { extractionSystemInstruction } from "./prompt";

export class GeminiConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiConfigurationError";
  }
}

export async function generateExtraction(sourceContent: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL;

  if (!apiKey || !model) {
    throw new GeminiConfigurationError(
      "AI processing is not configured. Continue manually or contact the workspace administrator.",
    );
  }

  const client = new GoogleGenAI({ apiKey });
  const response = await client.models.generateContent({
    model,
    contents: sourceContent,
    config: {
      systemInstruction: extractionSystemInstruction,
      responseMimeType: "application/json",
      responseJsonSchema: z.toJSONSchema(extractionProviderSchema),
    },
  });

  if (!response.text) {
    throw new Error("The AI provider returned an empty response.");
  }

  try {
    return JSON.parse(response.text) as unknown;
  } catch {
    throw new Error("The AI provider returned invalid structured output.");
  }
}
