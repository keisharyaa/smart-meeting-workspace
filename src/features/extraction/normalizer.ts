import type { ValidatedExtractionResult } from "./schema";

export function normalizeExtractionResult(
  result: ValidatedExtractionResult,
): ValidatedExtractionResult {
  return {
    summary: result.summary.trim(),
    decisions: normalizeOutcomes(result.decisions),
    blockers: normalizeOutcomes(result.blockers),
    unresolvedQuestions: normalizeOutcomes(result.unresolvedQuestions),
    actionItems: result.actionItems.map((item) => ({
      ...item,
      title: item.title.trim(),
      description: normalizeNullable(item.description),
      picName: normalizeNullable(item.picName),
      picEmail: normalizeNullable(item.picEmail),
      dueTime: item.dueDate ? item.dueTime : null,
      sourceReference: normalizeNullable(item.sourceReference),
    })),
  };
}

function normalizeOutcomes<T extends { content: string; sourceReference: string | null }>(
  outcomes: T[],
) {
  return outcomes
    .map((outcome) => ({
      ...outcome,
      content: outcome.content.trim(),
      sourceReference: normalizeNullable(outcome.sourceReference),
    }))
    .filter((outcome) => outcome.content.length > 0);
}

function normalizeNullable(value: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
