import Link from "next/link";
import { ArrowLeft, ExternalLink, UserRound } from "lucide-react";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUserPersonDetail } from "@/features/people/queries";
import type {
  PeopleActionItem,
  PeopleActionItemPriority,
  PeopleActionItemRecord,
} from "@/features/people/types";

export const dynamic = "force-dynamic";

interface PersonDetailPageProps {
  params: Promise<{
    personKey: string;
  }>;
}

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

const deadlineLegend = [
  { label: "Overdue", className: "bg-[#5B3418]", description: "Past deadline" },
  { label: "Due soon", className: "bg-red-600", description: "Today or next 2 days" },
  { label: "Upcoming", className: "bg-yellow-500", description: "Next 3 to 5 days" },
  { label: "Later", className: "bg-green-600", description: "More than 5 days" },
  { label: "Not Mentioned", className: "bg-blue-600", description: "No clear deadline" },
];

export default async function PersonDetailPage({
  params,
}: PersonDetailPageProps) {
  const { personKey } = await params;
  const { person, error } = await getCurrentUserPersonDetail(personKey);

  if (error) {
    return (
      <PageContainer>
        <PageHeader eyebrow="People" title="PIC Detail" />
        <ErrorState
          title="PIC detail is unavailable"
          message={error}
          action={
            <Link href="/people" className={buttonVariants({ variant: "outline" })}>
              Back to People
            </Link>
          }
        />
      </PageContainer>
    );
  }

  if (!person) {
    return (
      <PageContainer>
        <PageHeader eyebrow="People" title="PIC Detail" />
        <EmptyState
          title="PIC not found"
          description="This PIC does not exist or does not have published official action items in your workspace."
          action={
            <Link href="/people" className={buttonVariants()}>
              Back to People
            </Link>
          }
          icon={<UserRound className="size-5" aria-hidden="true" />}
        />
      </PageContainer>
    );
  }

  const openActionItems = person.actionItems.filter(({ actionItem }) =>
    isOpenStatus(actionItem.status),
  );
  const completedActionItems = person.actionItems.filter(
    ({ actionItem }) => actionItem.status === "done",
  );

  return (
    <PageContainer className="max-w-6xl">
      <PageHeader
        eyebrow="People"
        title={person.fullName}
        description="PIC work overview generated from published official action items."
        actions={
          <>
            <Link
              href="/people"
              className={buttonVariants({ variant: "outline" })}
            >
              <ArrowLeft aria-hidden="true" />
              Back to People
            </Link>
            <Link
              href="/action-items"
              className={buttonVariants({ variant: "outline" })}
            >
              Open Action Items
            </Link>
          </>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
        <Card>
          <CardHeader>
            <CardTitle className="heading-section">PIC Information</CardTitle>
            <CardDescription>
              Lightweight contact data. This PIC is not an app account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <Info label="Full name" value={person.fullName} />
              <Info label="Email" value={person.email ?? "Not Mentioned"} />
              <Info label="Role" value={person.role ?? "Not Mentioned"} />
            </dl>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Metric label="Open action items" value={person.openActionItemCount} />
              <Metric
                label="Completed action items"
                value={person.completedActionItemCount}
              />
            </div>

            <p className="mt-5 text-helper">
              Edit PIC information is planned for the next People stage.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="heading-section">
              Deadline Condition Legend
            </CardTitle>
            <CardDescription>
              Deadline condition is separate from workflow status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {deadlineLegend.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span
                    className={`size-3 rounded-full ${item.className}`}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.label}
                    </p>
                    <p className="text-helper">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <RelatedCard
          title="Related Projects"
          emptyLabel="No related projects."
          items={person.relatedProjects.map((project) => ({
            id: project.id,
            label: project.name,
            href: `/projects/${project.id}`,
          }))}
        />
        <RelatedCard
          title="Related Published Meetings"
          emptyLabel="No related published meetings."
          items={person.relatedPublishedMeetings.map((meeting) => ({
            id: meeting.id,
            label: meeting.title,
            helper: dateFormatter.format(new Date(meeting.meetingDate)),
            href: `/meetings/${meeting.id}`,
          }))}
        />
      </section>

      <ActionItemSection
        title="Open Action Items"
        description="To Do, In Progress, and Blocked work assigned to this PIC."
        emptyLabel="No open action items."
        actionItems={openActionItems}
      />

      <ActionItemSection
        title="Completed Action Items"
        description="Done action items assigned to this PIC."
        emptyLabel="No completed action items."
        actionItems={completedActionItems}
      />
    </PageContainer>
  );
}

function RelatedCard({
  title,
  emptyLabel,
  items,
}: {
  title: string;
  emptyLabel: string;
  items: Array<{ id: string; label: string; helper?: string; href: string }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="heading-section">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-helper">{emptyLabel}</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted"
              >
                <span>
                  <span className="block text-sm font-medium text-foreground">
                    {item.label}
                  </span>
                  {item.helper ? (
                    <span className="text-helper">{item.helper}</span>
                  ) : null}
                </span>
                <ExternalLink className="size-4 text-muted-foreground" aria-hidden="true" />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActionItemSection({
  title,
  description,
  emptyLabel,
  actionItems,
}: {
  title: string;
  description: string;
  emptyLabel: string;
  actionItems: PeopleActionItemRecord[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="heading-section">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {actionItems.length === 0 ? (
          <p className="text-helper">{emptyLabel}</p>
        ) : (
          <div className="space-y-3">
            {actionItems.map((record) => (
              <ActionItemCard key={record.actionItem.id} record={record} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActionItemCard({ record }: { record: PeopleActionItemRecord }) {
  const { actionItem, projectName, meetingTitle } = record;
  const deadline = getDeadlineCondition(actionItem);

  return (
    <article
      className={`rounded-lg border border-border border-l-4 ${deadline.borderClassName} p-4`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="heading-card text-foreground">{actionItem.title}</h3>
          <p className="mt-1 text-body text-foreground">
            {actionItem.description ?? "No description."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={deadline.variant}>{deadline.label}</Badge>
          <Badge variant={actionItem.status === "done" ? "success" : "secondary"}>
            {statusLabel(actionItem.status)}
          </Badge>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <Info label="Related project" value={projectName} />
        <Info label="Source meeting" value={meetingTitle ?? "Not Mentioned"} />
        <Info label="Deadline" value={formatDeadline(actionItem)} />
        <Info label="Priority" value={priorityLabel(actionItem.priority)} />
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/action-items?q=${encodeURIComponent(actionItem.title)}`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Open related action
        </Link>
        {actionItem.meeting_id ? (
          <Link
            href={`/meetings/${actionItem.meeting_id}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Open source meeting
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-caption text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-body text-foreground">{value}</dd>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-caption text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function isOpenStatus(status: PeopleActionItem["status"]) {
  return status === "todo" || status === "in_progress" || status === "blocked";
}

function getDeadlineCondition(actionItem: PeopleActionItem) {
  if (actionItem.status === "done") {
    return {
      label: "Completed",
      variant: "success" as const,
      borderClassName: "border-l-success",
    };
  }

  if (!actionItem.due_date) {
    return {
      label: "Not Mentioned",
      variant: "info" as const,
      borderClassName: "border-l-blue-600",
    };
  }

  const today = startOfDay(new Date());
  const dueDate = startOfDay(new Date(actionItem.due_date));
  const dayDifference = Math.ceil(
    (dueDate.getTime() - today.getTime()) / 86_400_000,
  );

  if (dayDifference < 0) {
    return {
      label: "Overdue",
      variant: "warning" as const,
      borderClassName: "border-l-[#5B3418]",
    };
  }

  if (dayDifference <= 2) {
    return {
      label: "Due soon",
      variant: "destructive" as const,
      borderClassName: "border-l-red-600",
    };
  }

  if (dayDifference <= 5) {
    return {
      label: "Upcoming",
      variant: "warning" as const,
      borderClassName: "border-l-yellow-500",
    };
  }

  return {
    label: "Later",
    variant: "success" as const,
    borderClassName: "border-l-green-600",
  };
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDeadline(actionItem: PeopleActionItem) {
  if (!actionItem.due_date) {
    return "Not Mentioned";
  }

  if (!actionItem.due_time) {
    return `${dateFormatter.format(new Date(actionItem.due_date))}, Time Not Mentioned`;
  }

  return dateTimeFormatter.format(
    new Date(`${actionItem.due_date}T${actionItem.due_time}`),
  );
}

function priorityLabel(priority: PeopleActionItemPriority) {
  if (!priority) {
    return "Not Mentioned";
  }

  return priority
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusLabel(status: PeopleActionItem["status"]) {
  switch (status) {
    case "todo":
      return "To Do";
    case "in_progress":
      return "In Progress";
    case "blocked":
      return "Blocked";
    case "done":
      return "Done";
    default:
      return status;
  }
}
