"use client";

import { Plus } from "lucide-react";

import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ReviewActionItem } from "@/features/review-drafts/types";

import { DraftActionItemRow } from "./draft-action-item-row";

export function DraftActionItemsEditor({
  items,
  expandedId,
  projectId,
  projectName,
  meetingId,
  meetingTitle,
  disabled,
  errors,
  onItemsChange,
  onExpandedChange,
}: {
  items: ReviewActionItem[];
  expandedId: string | null;
  projectId: string;
  projectName: string;
  meetingId: string;
  meetingTitle: string;
  disabled?: boolean;
  errors: Record<string, string>;
  onItemsChange: (items: ReviewActionItem[]) => void;
  onExpandedChange: (id: string | null) => void;
}) {
  function addItem() {
    const id = crypto.randomUUID();
    onItemsChange([
      ...items,
      {
        id,
        projectId,
        meetingId,
        title: "",
        description: null,
        picName: null,
        picEmail: null,
        dueDate: null,
        dueTime: null,
        priority: null,
        clarificationStatus: "needs_clarification",
        sourceReference: null,
        displayOrder: items.length,
      },
    ]);
    onExpandedChange(id);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="heading-section">Draft Action Items</CardTitle>
            <CardDescription className="mt-1">
              Verify every follow-up before it can be considered for future publication.
            </CardDescription>
          </div>
          <Button type="button" variant="outline" onClick={addItem} disabled={disabled}>
            <Plus />
            Add Draft Action Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            compact
            title="No draft action items"
            description="Add an action only when the notes indicate a commitment, responsibility, or follow-up."
            action={<Button type="button" variant="outline" onClick={addItem} disabled={disabled}><Plus />Add Draft Action Item</Button>}
          />
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <DraftActionItemRow
                key={item.id}
                item={item}
                index={index}
                projectName={projectName}
                meetingTitle={meetingTitle}
                expanded={expandedId === item.id}
                disabled={disabled}
                error={errors[item.id]}
                onToggle={() => onExpandedChange(expandedId === item.id ? null : item.id)}
                onChange={(next) => onItemsChange(items.map((current) => current.id === item.id ? next : current))}
                onRemove={() => {
                  onItemsChange(items.filter((current) => current.id !== item.id));
                  if (expandedId === item.id) onExpandedChange(null);
                }}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
