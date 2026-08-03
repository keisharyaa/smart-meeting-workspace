import { z } from "zod";

export const extractionProviderSchema = z
  .object({
    summary: z.string().max(20_000),
    decisions: z.array(
      z.object({
        content: z.string().max(10_000),
        sourceReference: z.string().nullable(),
      }).strict(),
    ).max(100),
    blockers: z.array(
      z.object({
        content: z.string().max(10_000),
        sourceReference: z.string().nullable(),
      }).strict(),
    ).max(100),
    unresolvedQuestions: z.array(
      z.object({
        content: z.string().max(10_000),
        sourceReference: z.string().nullable(),
      }).strict(),
    ).max(100),
    actionItems: z.array(
      z.object({
        title: z.string().max(500),
        description: z.string().nullable(),
        picName: z.string().nullable(),
        picEmail: z.string().nullable(),
        dueDate: z.string().nullable(),
        dueTime: z.string().nullable(),
        priority: z.enum(["low", "medium", "high"]).nullable(),
        clarificationStatus: z.enum(["clear", "needs_clarification"]),
        sourceReference: z.string().nullable(),
      }).strict(),
    ).max(200),
  })
  .strict();

const nullableTrimmedString = z
  .union([z.string(), z.null()])
  .transform((value) => {
    if (value === null) return null;
    const trimmed = value.trim();
    return trimmed || null;
  });

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, "Invalid calendar date");

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export const outcomeItemSchema = z
  .object({
    content: z.string().trim().min(1).max(10_000),
    sourceReference: nullableTrimmedString,
  })
  .strict();

export const draftActionItemSchema = z
  .object({
    title: z.string().trim().min(1).max(500),
    description: nullableTrimmedString,
    picName: nullableTrimmedString,
    picEmail: z
      .union([z.string().trim().email(), z.literal(""), z.null()])
      .transform((value) => value || null),
    dueDate: z.union([dateSchema, z.literal(""), z.null()]).transform((value) => value || null),
    dueTime: z.union([timeSchema, z.literal(""), z.null()]).transform((value) => value || null),
    priority: z.enum(["low", "medium", "high"]).nullable(),
    clarificationStatus: z.enum(["clear", "needs_clarification"]),
    sourceReference: nullableTrimmedString,
  })
  .strict()
  .superRefine((value, context) => {
    if (value.dueTime && !value.dueDate) {
      context.addIssue({
        code: "custom",
        path: ["dueTime"],
        message: "A deadline time requires a deadline date.",
      });
    }
  });

export const extractionResultSchema = z
  .object({
    summary: z.string().trim().max(20_000),
    decisions: z.array(outcomeItemSchema).max(100),
    blockers: z.array(outcomeItemSchema).max(100),
    unresolvedQuestions: z.array(outcomeItemSchema).max(100),
    actionItems: z.array(draftActionItemSchema).max(200),
  })
  .strict();

export type ValidatedExtractionResult = z.infer<typeof extractionResultSchema>;

export const extractionProviderJsonSchema = {
  type: "object",
  properties: {
    summary: {
      type: "string",
    },
    decisions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          content: {
            type: "string",
          },
          sourceReference: {
            anyOf: [
              { type: "string" },
              { type: "null" },
            ],
          },
        },
        required: ["content", "sourceReference"],
        additionalProperties: false,
      },
    },
    blockers: {
      type: "array",
      items: {
        type: "object",
        properties: {
          content: {
            type: "string",
          },
          sourceReference: {
            anyOf: [
              { type: "string" },
              { type: "null" },
            ],
          },
        },
        required: ["content", "sourceReference"],
        additionalProperties: false,
      },
    },
    unresolvedQuestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          content: {
            type: "string",
          },
          sourceReference: {
            anyOf: [
              { type: "string" },
              { type: "null" },
            ],
          },
        },
        required: ["content", "sourceReference"],
        additionalProperties: false,
      },
    },
    actionItems: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
          },
          description: {
            anyOf: [
              { type: "string" },
              { type: "null" },
            ],
          },
          picName: {
            anyOf: [
              { type: "string" },
              { type: "null" },
            ],
          },
          picEmail: {
            anyOf: [
              { type: "string" },
              { type: "null" },
            ],
          },
          dueDate: {
            anyOf: [
              { type: "string" },
              { type: "null" },
            ],
          },
          dueTime: {
            anyOf: [
              { type: "string" },
              { type: "null" },
            ],
          },
          priority: {
            anyOf: [
              {
                type: "string",
                enum: ["low", "medium", "high"],
              },
              {
                type: "null",
              },
            ],
          },
          clarificationStatus: {
            type: "string",
            enum: ["clear", "needs_clarification"],
          },
          sourceReference: {
            anyOf: [
              { type: "string" },
              { type: "null" },
            ],
          },
        },
        required: [
          "title",
          "description",
          "picName",
          "picEmail",
          "dueDate",
          "dueTime",
          "priority",
          "clarificationStatus",
          "sourceReference",
        ],
        additionalProperties: false,
      },
    },
  },
  required: [
    "summary",
    "decisions",
    "blockers",
    "unresolvedQuestions",
    "actionItems",
  ],
  additionalProperties: false,
} as const;