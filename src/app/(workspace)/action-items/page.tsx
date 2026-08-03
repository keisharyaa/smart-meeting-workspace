import Link from "next/link";
import { CalendarClock, ClipboardList, Plus, Save, Search } from "lucide-react";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createManualActionItemAction,
  updateActionItemAction,
  updateActionItemStatusAction,
} from "@/features/action-items/actions";
import { DeadlineFields } from "@/features/action-items/components/deadline-fields";
import { DeleteActionItemButton } from "@/features/action-items/components/delete-action-item-button";
import { getCurrentUserActionItemsPageData } from "@/features/action-items/queries";
import type {
  ActionItem,
  ActionItemPriorityFilter,
  ActionItemProject,
  ActionItemStatus,
  OfficialActionItemRecord,
} from "@/features/action-items/types";

export const metadata = {
  title: "Action Items",
};

export const dynamic = "force-dynamic";

interface ActionItemsPageProps {
  searchParams: Promise<{
    project?: string;
    status?: string;
    priority?: string;
    q?: string;
  }>;
}

const statusColumns: Array<{
  status: ActionItemStatus;
  title: string;
  description: string;
  badgeVariant: "outline" | "warning" | "destructive" | "success";
  accentClassName: string;
}> = [
  {
    status: "todo",
    title: "To Do",
    description: "Ready to start",
    badgeVariant: "outline",
    accentClassName: "border-t-primary",
  },
  {
    status: "in_progress",
    title: "In Progress",
    description: "Currently moving",
    badgeVariant: "warning",
    accentClassName: "border-t-primary",
  },
  {
    status: "blocked",
    title: "Blocked",
    description: "Needs help",
    badgeVariant: "destructive",
    accentClassName: "border-t-primary",
  },
  {
    status: "done",
    title: "Done",
    description: "Completed",
    badgeVariant: "success",
    accentClassName: "border-t-primary",
  },
];

const priorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
} as const;

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

export default async function ActionItemsPage({
  searchParams,
}: ActionItemsPageProps) {
  const params = await searchParams;
  const filters = {
    projectId: params.project,
    status: parseStatusParam(params.status),
    priority: parsePriorityFilterParam(params.priority),
    search: params.q,
  };
  const { actionItems, projects, error } =
    await getCurrentUserActionItemsPageData(filters);
  const activeProjects = projects.filter((project) => project.status === "active");
  const currentPath = buildActionItemsPath(params);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Workspace"
        title="Action Items"
        description="Track official follow-up work after meeting outcomes are approved and published."
      />

      {error ? (
        <ErrorState title="Action items are unavailable" message={error} />
      ) : (
        <div className="space-y-6">
          <ActionItemCreateCard projects={activeProjects} returnTo={currentPath} />
          <ActionItemFilters projects={projects} filters={filters} />

          {actionItems.length === 0 ? (
            <EmptyState
              title="No official action items found"
              description="Published meeting actions and manual action items will appear here."
              icon={<ClipboardList className="size-5" />}
            />
          ) : (
            <section
              className="grid gap-4 xl:grid-cols-4"
              aria-label="Action item board"
            >
              {statusColumns.map((column) => {
                const columnItems = actionItems.filter(
                  (item) => item.actionItem.status === column.status,
                );

                return (
                  <div
                    key={column.status}
                    className={`space-y-3 rounded-lg border border-border border-t-4 bg-background/70 p-3 ${column.accentClassName}`}
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                      <div>
                        <h2 className="heading-section text-foreground">
                          {column.title}
                        </h2>
                        <p className="text-caption text-muted-foreground">
                          {column.description}
                        </p>
                      </div>
                      <Badge variant={column.badgeVariant}>
                        {columnItems.length}
                      </Badge>
                    </div>

                    {columnItems.length === 0 ? (
                      <div className="rounded-md border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
                        No items.
                      </div>
                    ) : (
                      columnItems.map((record) => (
                        <ActionItemCard
                          key={record.actionItem.id}
                          record={record}
                          returnTo={currentPath}
                        />
                      ))
                    )}
                  </div>
                );
              })}
            </section>
          )}
        </div>
      )}
    </PageContainer>
  );
}

function ActionItemCreateCard({
  projects,
  returnTo,
}: {
  projects: ActionItemProject[];
  returnTo: string;
}) {
  return (
    <details className="rounded-lg border border-border bg-card shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 marker:content-none">
        <div>
          <h2 className="heading-section text-foreground">Create Manual Action Item</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add an official action item that was not created from Human Review.
          </p>
        </div>
        <span className={buttonVariants()}>
          <Plus />
          New action item
        </span>
      </summary>

      <div className="border-t border-border p-5">
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Create an active project before adding manual action items.
          </p>
        ) : (
          <form action={createManualActionItemAction} className="grid gap-4 lg:grid-cols-4">
            <input type="hidden" name="returnTo" value={returnTo} />
            <Field label="Project" htmlFor="create-project">
              <Select id="create-project" name="projectId" required defaultValue="">
                <option value="" disabled>
                  Select project
                </option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Title" htmlFor="create-title" className="lg:col-span-2">
              <Input id="create-title" name="title" required placeholder="Follow up with vendor" />
            </Field>

            <Field label="PIC" htmlFor="create-pic">
              <Input id="create-pic" name="picName" placeholder="Unknown" />
            </Field>

            <DeadlineFields dateId="create-due-date" timeId="create-due-time" />

            <Field label="Priority" htmlFor="create-priority">
              <PrioritySelect id="create-priority" />
            </Field>

            <Field label="Status" htmlFor="create-status">
              <StatusSelect id="create-status" defaultValue="todo" />
            </Field>

            <Field label="Description" htmlFor="create-description" className="lg:col-span-4">
              <Textarea
                id="create-description"
                name="description"
                placeholder="Add helpful context for this action item."
              />
            </Field>

            <div className="lg:col-span-4">
              <Button type="submit">
                <Plus />
                Create action item
              </Button>
            </div>
          </form>
        )}
      </div>
    </details>
  );
}

function ActionItemFilters({
  projects,
  filters,
}: {
  projects: ActionItemProject[];
  filters: {
    projectId?: string;
    status?: ActionItemStatus;
    priority?: ActionItemPriorityFilter;
    search?: string;
  };
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <form className="grid gap-3 md:grid-cols-[1fr_200px_170px_170px_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={filters.search ?? ""}
              placeholder="Search action items"
              className="pl-9"
            />
          </div>

          <Select name="project" defaultValue={filters.projectId ?? ""} aria-label="Filter by project">
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>

          <Select name="status" defaultValue={filters.status ?? ""} aria-label="Filter by status">
            <option value="">All statuses</option>
            {statusColumns.map((column) => (
              <option key={column.status} value={column.status}>
                {column.title}
              </option>
            ))}
          </Select>

          <Select name="priority" defaultValue={filters.priority ?? ""} aria-label="Filter by priority">
            <option value="">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="none">Not Mentioned</option>
          </Select>

          <Button type="submit" variant="outline">
            Apply
          </Button>

          <Link href="/action-items" className={buttonVariants({ variant: "ghost" })}>
            Clear
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}

function ActionItemCard({
  record,
  returnTo,
}: {
  record: OfficialActionItemRecord;
  returnTo: string;
}) {
  const { actionItem, projectName, meetingTitle } = record;
  const urgency = getUrgency(actionItem);

  return (
    <Card className={`border-l-4 ${urgency.borderClassName}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="heading-card">{actionItem.title}</CardTitle>
            <CardDescription className="mt-1 line-clamp-3">
              {actionItem.description ?? "No description."}
            </CardDescription>
          </div>
          <Badge variant={urgency.variant} className={urgency.badgeClassName}>
            {urgency.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid gap-3 text-sm">
          <Info label="Project" value={projectName} />
          <Info label="PIC" value={actionItem.pic_name ?? "Unknown"} />
          <Info label="Deadline" value={formatDeadline(actionItem)} valueClassName={urgency.textClassName} />
          <Info
            label="Priority"
            value={actionItem.priority ? priorityLabels[actionItem.priority] : "Not Mentioned"}
          />
          <Info label="Source meeting" value={meetingTitle ?? "Manual action item"} />
          <Info
            label="Source reference"
            value={actionItem.source_reference ?? "Not Mentioned"}
          />
        </dl>

        <form action={updateActionItemStatusAction} className="flex gap-2">
          <input type="hidden" name="actionItemId" value={actionItem.id} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <Select name="status" defaultValue={actionItem.status} aria-label="Update action status">
            {statusColumns.map((column) => (
              <option key={column.status} value={column.status}>
                {column.title}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="outline" aria-label="Save status">
            <Save />
            Update
          </Button>
        </form>

        <details className="rounded-lg border border-border bg-background p-3">
          <summary className="cursor-pointer text-sm font-medium text-foreground">
            Edit details
          </summary>

          <form action={updateActionItemAction} className="mt-4 grid gap-3">
            <input type="hidden" name="actionItemId" value={actionItem.id} />
            <input type="hidden" name="projectId" value={actionItem.project_id} />
            <input type="hidden" name="returnTo" value={returnTo} />

            <Field label="Title" htmlFor={`${actionItem.id}-title`}>
              <Input
                id={`${actionItem.id}-title`}
                name="title"
                required
                defaultValue={actionItem.title}
              />
            </Field>

            <Field label="Description" htmlFor={`${actionItem.id}-description`}>
              <Textarea
                id={`${actionItem.id}-description`}
                name="description"
                defaultValue={actionItem.description ?? ""}
              />
            </Field>

            <Field label="PIC" htmlFor={`${actionItem.id}-pic`}>
              <Input
                id={`${actionItem.id}-pic`}
                name="picName"
                defaultValue={actionItem.pic_name ?? ""}
              />
            </Field>

            <DeadlineFields
              dateId={`${actionItem.id}-due-date`}
              timeId={`${actionItem.id}-due-time`}
              defaultDate={actionItem.due_date}
              defaultTime={actionItem.due_time}
            />

            <div className="grid gap-3">
              <Field label="Priority" htmlFor={`${actionItem.id}-priority`}>
                <PrioritySelect
                  id={`${actionItem.id}-priority`}
                  defaultValue={actionItem.priority ?? ""}
                />
              </Field>
              <Field label="Status" htmlFor={`${actionItem.id}-status`}>
                <StatusSelect
                  id={`${actionItem.id}-status`}
                  defaultValue={actionItem.status}
                />
              </Field>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button type="submit">
                <Save />
                Save changes
              </Button>
              <DeleteActionItemButton
                actionItemId={actionItem.id}
                title={actionItem.title}
              />
            </div>
          </form>
        </details>

        {actionItem.meeting_id ? (
          <Link
            href={`/meetings/${actionItem.meeting_id}`}
            className={buttonVariants({ variant: "ghost", className: "w-full" })}
          >
            <CalendarClock />
            Open source meeting
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function PrioritySelect({
  id,
  defaultValue = "",
}: {
  id: string;
  defaultValue?: string;
}) {
  return (
    <Select id={id} name="priority" defaultValue={defaultValue}>
      <option value="">Not Mentioned</option>
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
    </Select>
  );
}

function StatusSelect({
  id,
  defaultValue,
}: {
  id: string;
  defaultValue: ActionItemStatus;
}) {
  return (
    <Select id={id} name="status" defaultValue={defaultValue}>
      {statusColumns.map((column) => (
        <option key={column.status} value={column.status}>
          {column.title}
        </option>
      ))}
    </Select>
  );
}

function Info({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`text-right text-foreground ${valueClassName ?? ""}`}>
        {value}
      </dd>
    </div>
  );
}

function parseStatusParam(status?: string): ActionItemStatus | undefined {
  if (statusColumns.some((column) => column.status === status)) {
    return status as ActionItemStatus;
  }

  return undefined;
}

function parsePriorityFilterParam(
  priority?: string,
): ActionItemPriorityFilter | undefined {
  if (
    priority === "low" ||
    priority === "medium" ||
    priority === "high" ||
    priority === "none"
  ) {
    return priority;
  }

  return undefined;
}

function buildActionItemsPath(params: {
  project?: string;
  status?: string;
  priority?: string;
  q?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set("q", params.q);
  if (params.project) searchParams.set("project", params.project);
  if (params.status) searchParams.set("status", params.status);
  if (params.priority) searchParams.set("priority", params.priority);

  const queryString = searchParams.toString();
  return queryString ? `/action-items?${queryString}` : "/action-items";
}

function getUrgency(actionItem: ActionItem): {
  label: string;
  variant: "outline" | "warning" | "info" | "destructive" | "success";
  borderClassName: string;
  badgeClassName: string;
  textClassName: string;
} {
  if (actionItem.status === "done") {
    return {
      label: "Done",
      variant: "success",
      borderClassName: "border-l-success",
      badgeClassName: "",
      textClassName: "font-medium text-success-foreground",
    };
  }

  if (!actionItem.due_date) {
    return {
      label: "Not Mentioned",
      variant: "info",
      borderClassName: "border-l-info",
      badgeClassName: "",
      textClassName: "font-medium text-info-foreground",
    };
  }

  const now = new Date();
  const dueAt = getDeadlineDateTime(actionItem);

  if (dueAt.getTime() < now.getTime()) {
    return {
      label: "Overdue",
      variant: "outline",
      borderClassName: "border-l-[#5f2f16]",
      badgeClassName: "border-[#5f2f16] bg-[#5f2f16]/10 text-[#5f2f16]",
      textClassName: "font-medium text-[#5f2f16]",
    };
  }

  const daysUntilDue = Math.ceil(
    (dueAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysUntilDue <= 2) {
    return {
      label: daysUntilDue === 0 ? "Due Today" : "Due Within 2 Days",
      variant: "destructive",
      borderClassName: "border-l-destructive",
      badgeClassName: "",
      textClassName: "font-medium text-destructive-foreground",
    };
  }

  if (daysUntilDue <= 5) {
    return {
      label: "Due Within 3-5 Days",
      variant: "warning",
      borderClassName: "border-l-warning",
      badgeClassName: "",
      textClassName: "font-medium text-warning-foreground",
    };
  }

  return {
    label: "More Than 5 Days Away",
    variant: "success",
    borderClassName: "border-l-success",
    badgeClassName: "",
    textClassName: "font-medium text-success-foreground",
  };
}

function getDeadlineDateTime(actionItem: ActionItem) {
  return new Date(
    `${actionItem.due_date}T${actionItem.due_time || "00:00:00"}`,
  );
}

function formatDeadline(actionItem: ActionItem) {
  if (!actionItem.due_date) {
    return "Not Mentioned";
  }

  const date = dateFormatter.format(new Date(`${actionItem.due_date}T00:00:00`));

  if (!actionItem.due_time) {
    return date;
  }

  return `${date}, ${actionItem.due_time}`;
}
