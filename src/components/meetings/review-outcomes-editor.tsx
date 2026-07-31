"use client";

import { Plus, Trash2 } from "lucide-react";

import { ConfirmationDialog } from "@/components/feedback/confirmation-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { ReviewOutcome } from "@/features/review-drafts/types";

const groups = [
  ["decision", "Decisions", "Decision"],
  ["blocker", "Blockers", "Blocker"],
  ["unresolved_question", "Unresolved Questions", "Question"],
] as const;

export function ReviewOutcomesEditor({
  summary,
  outcomes,
  disabled,
  onSummaryChange,
  onOutcomesChange,
}: {
  summary: string;
  outcomes: ReviewOutcome[];
  disabled?: boolean;
  onSummaryChange: (value: string) => void;
  onOutcomesChange: (value: ReviewOutcome[]) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="heading-section">Meeting Outcomes</CardTitle>
        <CardDescription>Review and edit the draft. Empty rows are omitted when saved.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="review-summary">Meeting Summary</Label>
          <p id="review-summary-help" className="text-helper mt-1">Summarize only information supported by the Original Meeting Notes.</p>
          <Textarea
            id="review-summary"
            className="mt-2 min-h-36"
            value={summary}
            disabled={disabled}
            aria-describedby="review-summary-help"
            onChange={(event) => onSummaryChange(event.target.value)}
          />
        </div>
        {groups.map(([type, title, singular]) => {
          const rows = outcomes.filter((outcome) => outcome.outcomeType === type);
          return (
            <section key={type} aria-labelledby={`review-${type}-heading`}>
              <Separator className="mb-5" />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 id={`review-${type}-heading`} className="heading-card">{title}</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  onClick={() =>
                    onOutcomesChange([
                      ...outcomes,
                      {
                        id: crypto.randomUUID(),
                        outcomeType: type,
                        content: "",
                        sourceReference: null,
                        displayOrder: rows.length,
                      },
                    ])
                  }
                >
                  <Plus />
                  Add {singular}
                </Button>
              </div>
              {rows.length === 0 ? (
                <p className="text-helper mt-3">No {title.toLowerCase()} added.</p>
              ) : (
                <div className="mt-3 space-y-3">
                  {rows.map((row, index) => {
                    const contentId = `${type}-${row.id}-content`;
                    const referenceId = `${type}-${row.id}-reference`;
                    return (
                      <div key={row.id} className="rounded-lg border border-border p-4">
                        <div className="flex items-start justify-between gap-3">
                          <Label htmlFor={contentId}>{singular} {index + 1}</Label>
                          <ConfirmationDialog
                            title={`Remove ${singular.toLowerCase()}?`}
                            description="This removes only this draft row. Save the draft to persist the change."
                            confirmLabel={`Remove ${singular}`}
                            destructive
                            onConfirm={() => onOutcomesChange(outcomes.filter((item) => item.id !== row.id))}
                            trigger={
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Remove ${singular.toLowerCase()} ${index + 1}`}
                                title={`Remove ${singular.toLowerCase()} ${index + 1}`}
                                disabled={disabled}
                              >
                                <Trash2 />
                              </Button>
                            }
                          />
                        </div>
                        <Textarea
                          id={contentId}
                          className="mt-2"
                          value={row.content}
                          disabled={disabled}
                          onChange={(event) =>
                            onOutcomesChange(outcomes.map((item) => item.id === row.id ? { ...item, content: event.target.value } : item))
                          }
                        />
                        <Label htmlFor={referenceId} className="mt-4 block">Source Reference</Label>
                        <Textarea
                          id={referenceId}
                          className="mt-2 min-h-20"
                          value={row.sourceReference ?? ""}
                          disabled={disabled}
                          placeholder="Optional. Example: Source 1: Planning notes"
                          onChange={(event) =>
                            onOutcomesChange(outcomes.map((item) => item.id === row.id ? { ...item, sourceReference: event.target.value || null } : item))
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </CardContent>
    </Card>
  );
}
