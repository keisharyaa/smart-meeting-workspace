import "server-only";

import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

import { extractionProviderSchema } from "./schema";
import { extractionSystemInstruction } from "./prompt";

const DEFAULT_GEMINI_MODEL = "gemini-3.1-flash-lite";

export class GeminiConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiConfigurationError";
  }
}

export function getConfiguredGeminiModel() {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

export async function generateExtraction(sourceContent: string): Promise<{
  model: string;
  output: unknown;
}> {
  const apiKey = process.env.GEMINI_API_KEY;
  const requestedModel = getConfiguredGeminiModel();

  if (!apiKey) {
    throw new GeminiConfigurationError(
      "AI processing is not configured. Continue manually or contact the workspace administrator.",
    );
  }

  const client = new GoogleGenAI({ apiKey });
  const modelsToTry = Array.from(
    new Set([requestedModel, DEFAULT_GEMINI_MODEL]),
  );

  let lastError: unknown = null;

  for (const model of modelsToTry) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: sourceContent,
        config: {
          systemInstruction: extractionSystemInstruction,
          responseMimeType: "application/json",
          responseJsonSchema: z.toJSONSchema(extractionProviderSchema),
          temperature: 0,
        },
      });

      if (!response.text) {
        throw new Error("The AI provider returned an empty response.");
      }

      try {
        return {
          model,
          output: JSON.parse(response.text) as unknown,
        };
      } catch {
        throw new Error("The AI provider returned invalid structured output.");
      }
    } catch (error) {
      lastError = error;

      if (isAuthenticationError(error)) {
        throw new GeminiConfigurationError(
          "The Gemini API key was rejected. Replace GEMINI_API_KEY and try again.",
        );
      }

      if (!isUnavailableModelError(error, model)) {
        throw error;
      }
    }
  }

  throw lastError ?? new Error("The AI provider could not be reached.");
}

function isUnavailableModelError(error: unknown, model: string) {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return (
    message.includes("no longer available") ||
    message.includes(`models/${model.toLowerCase()}`) ||
    message.includes(`model ${model.toLowerCase()}`) ||
    message.includes('"status":"not_found"')
  );
}

function isAuthenticationError(error: unknown) {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return (
    message.includes('"status":"unauthenticated"') ||
    message.includes('"status":"permission_denied"') ||
    message.includes("api key not valid") ||
    message.includes("api key") && message.includes("rejected")
  );
}
