# AI Extraction Contract

## Purpose

Gemini produces a draft. The result is never official until the workspace owner reviews and publishes it.

## Required Behavior

Gemini must remain grounded in the provided source, distinguish decisions, blockers, questions, and action items, preserve uncertainty, use `null` when information is not stated, and avoid fabricating PIC, date, time, priority, or source content.

## Output Shape

```ts
type ExtractionResult = {
  summary: string;
  decisions: OutcomeItem[];
  blockers: OutcomeItem[];
  unresolvedQuestions: OutcomeItem[];
  actionItems: DraftActionItem[];
};

type OutcomeItem = {
  content: string;
  sourceReference: string | null;
};

type DraftActionItem = {
  title: string;
  description: string | null;
  picName: string | null;
  picEmail: string | null;
  dueDate: string | null;
  dueTime: string | null;
  priority: "low" | "medium" | "high" | null;
  clarificationStatus: "clear" | "needs_clarification";
  sourceReference: string | null;
};
```

## Missing Values

- PIC absent: `picName: null`
- Deadline absent: `dueDate: null`, `dueTime: null`
- Date present, time absent: date value, `dueTime: null`
- Priority absent: `priority: null`

UI labels:

- null PIC: `Unknown`
- null deadline: `Not Mentioned`
- date without time: `Time Not Mentioned`

## Validation

Validate with Zod or equivalent. Reject invalid enums, malformed dates or times, and invalid root shapes. Convert empty strings to null for nullable fields. Do not add inferred values.

## Failure Handling

Preserve metadata and original sources, preserve any valid existing draft, show Retry and Continue Manually, and never display partial invalid AI output as successful.

## Prompt Guardrails

```text
Use only information supported by the meeting source.
Do not invent a PIC, deadline, time, priority, decision, blocker, or question.
Use null when information is not explicitly stated.
A date without a time must keep the time null.
Return a draft only. The user will review and publish it separately.
```
