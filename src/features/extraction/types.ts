export interface ExtractedActionItem {
  title: string;
  description: string | null;
  picName: string | null;
  dueDate: string | null;
  dueTime: string | null;
  priority: "low" | "medium" | "high" | null;
  sourceReference: string | null;
}

export interface ExtractionOutput {
  summary: string;
  decisions: Array<{ content: string; sourceReference: string | null }>;
  blockers: Array<{ content: string; sourceReference: string | null }>;
  unresolvedQuestions: Array<{ content: string; sourceReference: string | null }>;
  actionItems: ExtractedActionItem[];
}
