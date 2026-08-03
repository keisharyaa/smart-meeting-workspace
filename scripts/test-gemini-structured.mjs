import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

import { extractionSystemInstruction } from "../src/features/extraction/prompt.ts";
import { extractionProviderSchema } from "../src/features/extraction/schema.ts";

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL;
const responseMimeType = "application/json";
const responseJsonSchema = z.toJSONSchema(extractionProviderSchema);
const syntheticMeetingNotes = [
  "Synthetic meeting notes:",
  "Ari will prepare a fictional project status summary by 2030-01-15.",
  "The group decided to use the fictional blue launch plan.",
].join("\n");

function sanitizeProviderMessage(error) {
  const rawMessage = error instanceof Error ? error.message : String(error);
  const secrets = [apiKey, syntheticMeetingNotes, extractionSystemInstruction].filter(Boolean);

  return secrets.reduce(
    (message, secret) => message.replaceAll(secret, "[REDACTED]"),
    rawMessage,
  );
}

function omitKeyword(value, keyword) {
  if (Array.isArray(value)) return value.map((item) => omitKeyword(item, keyword));
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== keyword)
      .map(([key, child]) => [key, omitKeyword(child, keyword)]),
  );
}

async function isolateRejectedKeyword(client) {
  const candidates = ["$schema", "maxLength", "maxItems", "additionalProperties", "anyOf"];

  for (const keyword of candidates) {
    try {
      await client.models.generateContent({
        model,
        contents: syntheticMeetingNotes,
        config: {
          systemInstruction: extractionSystemInstruction,
          responseMimeType,
          responseJsonSchema: omitKeyword(responseJsonSchema, keyword),
        },
      });
      return keyword;
    } catch {
      // A single-keyword omission that still fails does not identify the cause.
    }
  }

  return "not isolated by single-keyword omission";
}

async function isolateMaxItemsPath(client) {
  const propertyNames = ["decisions", "blockers", "unresolvedQuestions", "actionItems"];

  for (const propertyName of propertyNames) {
    const candidateSchema = structuredClone(responseJsonSchema);
    delete candidateSchema.properties[propertyName].maxItems;

    try {
      await client.models.generateContent({
        model,
        contents: syntheticMeetingNotes,
        config: {
          systemInstruction: extractionSystemInstruction,
          responseMimeType,
          responseJsonSchema: candidateSchema,
        },
      });
      return `${propertyName}.maxItems (${responseJsonSchema.properties[propertyName].maxItems})`;
    } catch {
      // Continue until removing one occurrence makes the request valid.
    }
  }

  return "multiple maxItems occurrences or maxItems generally";
}

console.log("model:", model ?? "not-configured");
console.log("generated JSON Schema:", JSON.stringify(responseJsonSchema, null, 2));

if (!apiKey || !model) {
  console.log("provider status:", "not-called");
  console.log(
    "sanitized provider message:",
    "Missing GEMINI_API_KEY or GEMINI_MODEL. No provider request was sent.",
  );
  process.exitCode = 1;
} else {
  const client = new GoogleGenAI({ apiKey });

  try {
    const response = await client.models.generateContent({
      model,
      contents: syntheticMeetingNotes,
      config: {
        systemInstruction: extractionSystemInstruction,
        responseMimeType,
        responseJsonSchema,
      },
    });

    console.log("provider status:", "success");
    console.log("sanitized provider message:", "none");
    console.log("response on success:", response.text ?? "[empty response]");
  } catch (error) {
    const status = error?.status ?? error?.code ?? "unknown";
    console.log("provider status:", status);
    console.log("sanitized provider message:", sanitizeProviderMessage(error));
    if (status === 400) {
      const rejectedKeyword = await isolateRejectedKeyword(client);
      console.log("rejected JSON Schema keyword:", rejectedKeyword);
      if (rejectedKeyword === "maxItems") {
        console.log("rejected JSON Schema field:", await isolateMaxItemsPath(client));
      }
    }
    process.exitCode = 1;
  }
}
