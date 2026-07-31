"use client";

import { ChevronUp, Pencil, Trash2 } from "lucide-react";

import { ConfirmationDialog } from "@/components/feedback/confirmation-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ReviewActionItem } from "@/features/review-drafts/types";

export function DraftActionItemRow({
  item,
  index,
  projectName,
  meetingTitle,
  expanded,
  disabled,
  error,
  onToggle,
  onChange,
  onRemove,
}: {
  item: ReviewActionItem;
  index: number;
  projectName: string;
  meetingTitle: string;
  expanded: boolean;
  disabled?: boolean;
  error?: string;
  onToggle: () => void;
  onChange: (item: ReviewActionItem) => void;
  onRemove: () => void;
}) {
  const prefix = `draft-action-${item.id}`;
  const deadline = item.dueDate
    ? `${item.dueDate}, ${item.dueTime ?? "Time Not Mentioned"}`
    : "Not Mentioned";

  function field<K extends keyof ReviewActionItem>(key: K, value: ReviewActionItem[K]) {
    onChange({ ...item, [key]: value });
  }

  return (
    <article className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-start gap-4 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">
              {item.title || `Draft Action Item ${index + 1}`}
            </p>
            {item.clarificationStatus === "needs_clarification" ? (
              <Badge variant="warning">Needs Clarification</Badge>
            ) : null}
          </div>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div><dt className="text-caption text-muted-foreground">Project</dt><dd>{projectName}</dd></div>
            <div><dt className="text-caption text-muted-foreground">PIC</dt><dd>{item.picName ?? "Unknown"}</dd></div>
            <div><dt className="text-caption text-muted-foreground">PIC role</dt><dd>{item.picRole ?? "Not Mentioned"}</dd></div>
            <div><dt className="text-caption text-muted-foreground">Deadline</dt><dd>{deadline}</dd></div>
            <div><dt className="text-caption text-muted-foreground">Priority</dt><dd className="capitalize">{item.priority ?? "Not Mentioned"}</dd></div>
          </dl>
          {error ? <p className="mt-3 text-sm text-destructive" role="alert">{error}</p> : null}
        </div>
        <div className="flex items-center gap-1">
          <Button type="button" variant="outline" size="sm" onClick={onToggle} disabled={disabled} aria-expanded={expanded} aria-controls={`${prefix}-editor`}>
            {expanded ? <ChevronUp /> : <Pencil />}
            {expanded ? "Close editor" : "Edit"}
          </Button>
          <ConfirmationDialog
            title="Remove draft action item?"
            description="This removes only this draft row. Save the draft to persist the change."
            confirmLabel="Remove Action Item"
            destructive
            onConfirm={onRemove}
            trigger={
              <Button type="button" variant="ghost" size="icon-sm" aria-label={`Remove draft action item ${index + 1}`} disabled={disabled}>
                <Trash2 />
              </Button>
            }
          />
        </div>
      </div>

      {expanded ? (
        <div id={`${prefix}-editor`} className="grid gap-4 border-t border-border p-4 md:grid-cols-2" role="region" aria-label={`Edit draft action item ${index + 1}`}>
          <Field id={`${prefix}-title`} label="Action Item title" required className="md:col-span-2">
            <Input id={`${prefix}-title`} value={item.title} disabled={disabled} aria-invalid={Boolean(error)} onChange={(event) => field("title", event.target.value)} />
          </Field>
          <Field id={`${prefix}-description`} label="Description" className="md:col-span-2">
            <Textarea id={`${prefix}-description`} value={item.description ?? ""} disabled={disabled} onChange={(event) => field("description", event.target.value || null)} />
          </Field>
          <Field id={`${prefix}-pic`} label="PIC name" helper="Leave blank when the PIC is unknown.">
            <Input id={`${prefix}-pic`} value={item.picName ?? ""} disabled={disabled} placeholder="Unknown" onChange={(event) => field("picName", event.target.value || null)} />
          </Field>
          <Field id={`${prefix}-email`} label="PIC email" helper="Optional.">
            <Input id={`${prefix}-email`} type="email" value={item.picEmail ?? ""} disabled={disabled} onChange={(event) => field("picEmail", event.target.value || null)} />
          </Field>
          <Field id={`${prefix}-role`} label="PIC role" helper="Optional. Add a role when it is mentioned in the meeting notes.">
            <Input id={`${prefix}-role`} value={item.picRole ?? ""} disabled={disabled} placeholder="Product Manager" onChange={(event) => field("picRole", event.target.value || null)} />
          </Field>
          <Field id={`${prefix}-date`} label="Deadline date" helper="Leave blank when not mentioned.">
            <Input id={`${prefix}-date`} type="date" value={item.dueDate ?? ""} disabled={disabled} onChange={(event) => field("dueDate", event.target.value || null)} />
          </Field>
          <Field id={`${prefix}-time`} label="Deadline hour and minute" helper={item.dueDate ? "Leave blank when time is not mentioned." : "Add a date before adding a time."}>
            <Input id={`${prefix}-time`} type="time" value={item.dueTime ?? ""} disabled={disabled || !item.dueDate} onChange={(event) => field("dueTime", event.target.value || null)} />
          </Field>
          <Field id={`${prefix}-priority`} label="Priority">
            <Select id={`${prefix}-priority`} value={item.priority ?? ""} disabled={disabled} onChange={(event) => field("priority", (event.target.value || null) as ReviewActionItem["priority"])}>
              <option value="">Not Mentioned</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </Field>
          <Field id={`${prefix}-clarification`} label="Clarification status">
            <Select id={`${prefix}-clarification`} value={item.clarificationStatus} disabled={disabled} onChange={(event) => field("clarificationStatus", event.target.value as ReviewActionItem["clarificationStatus"])}>
              <option value="clear">Clear</option>
              <option value="needs_clarification">Needs Clarification</option>
            </Select>
          </Field>
          <Field id={`${prefix}-project`} label="Project">
            <Input id={`${prefix}-project`} value={projectName} readOnly disabled />
          </Field>
          <Field id={`${prefix}-meeting`} label="Source meeting">
            <Input id={`${prefix}-meeting`} value={meetingTitle} readOnly disabled />
          </Field>
          <Field id={`${prefix}-source`} label="Source reference" helper="Optional. Identify the supporting source when available." className="md:col-span-2">
            <Textarea id={`${prefix}-source`} className="min-h-20" value={item.sourceReference ?? ""} disabled={disabled} onChange={(event) => field("sourceReference", event.target.value || null)} />
          </Field>
        </div>
      ) : null}
    </article>
  );
}

function Field({
  id,
  label,
  helper,
  required,
  className,
  children,
}: {
  id: string;
  label: string;
  helper?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id}>{label}{required ? <span className="text-destructive"> *</span> : null}</Label>
      {helper ? <p className="text-helper mt-1">{helper}</p> : null}
      <div className="mt-2">{children}</div>
    </div>
  );
}
