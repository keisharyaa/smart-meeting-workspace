import Link from "next/link";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { OriginalNotesPanel } from "@/components/meetings/original-notes-panel";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserPublishedMeeting } from "@/features/meetings/queries";
import type { OfficialActionItem, MeetingOutcome } from "@/features/meetings/types";

export const dynamic = "force-dynamic";

interface MeetingDetailPageProps {
  params: Promise<{
    meetingId: string;
  }>;
}

const meetingStatusPresentation = {
  draft: { label: "Draft", variant: "outline" as const },
  processing: { label: "Processing", variant: "warning" as const },
  completed: { label: "Completed", variant: "success" as const },
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function MeetingDetailPage({
  params,
}: MeetingDetailPageProps) {
  const { meetingId } = await params;
  const { meetingDetail, error } = await getCurrentUserPublishedMeeting(meetingId);

  if (error) {
    return (
      <PageContainer>
        <PageHeader eyebrow="Meetings" title="Meeting Detail" />
        <ErrorState
          title="Meeting detail is unavailable"
          message={error}
          action={
            <Link href="/meetings" className={buttonVariants({ variant: "outline" })}>
              Back to Meetings
            </Link>
          }
        />
      </PageContainer>
    );
  }

  if (!meetingDetail) {
    return (
      <PageContainer>
        <PageHeader eyebrow="Meetings" title="Meeting Detail" />
        <EmptyState
          title="Meeting not found"
          description="This meeting does not exist or is not available in your workspace."
          action={
            <Link href="/meetings" className={buttonVariants()}>
              Back to Meetings
            </Link>
          }
        />
      </PageContainer>
    );
  }

  const { meeting, projectName, sources, outcomes, actionItems } = meetingDetail;
  const status = meetingStatusPresentation[meeting.status];

  return (
    <PageContainer className="max-w-5xl">
      <PageHeader
        eyebrow="Meetings"
        title={meeting.title}
        description="Published meeting record and approved follow-up actions."
        actions={
          <>
            <Link
              href="/meetings"
              className={buttonVariants({ variant: "outline" })}
            >
              Back to Meetings
            </Link>
            <Badge variant={status.variant}>{status.label}</Badge>
          </>
        }
      />

      <Card>
        <CardContent className="pt-5">
          <dl className="grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-caption font-medium text-muted-foreground">
                Project
              </dt>
              <dd className="mt-1.5 text-body text-foreground">{projectName}</dd>
            </div>

            <div>
              <dt className="text-caption font-medium text-muted-foreground">
                Meeting date
              </dt>
              <dd className="mt-1.5 text-body text-foreground">
                {formatMeetingDate(meeting.meeting_date, meeting.meeting_time)}
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-caption font-medium text-muted-foreground">
                Participants
              </dt>
              <dd className="mt-1.5 text-body text-foreground">
                {meeting.participants.length > 0
                  ? meeting.participants.join(", ")
                  : "No participants recorded."}
              </dd>
            </div>

            <div>
              <dt className="text-caption font-medium text-muted-foreground">
                Published
              </dt>
              <dd className="mt-1.5 text-body text-foreground">
                {meeting.published_at
                  ? dateTimeFormatter.format(new Date(meeting.published_at))
                  : "Not published"}
              </dd>
            </div>

            <div>
              <dt className="text-caption font-medium text-muted-foreground">
                Last updated
              </dt>
              <dd className="mt-1.5 text-body text-foreground">
                {dateTimeFormatter.format(new Date(meeting.updated_at))}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <OriginalNotesPanel sources={sources} />

      <Card>
        <CardHeader>
          <CardTitle className="heading-section">Approved Summary</CardTitle>
          <CardDescription>
            Official summary from the published Human Review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-body whitespace-pre-wrap text-foreground">
            {meeting.approved_summary?.trim()
              ? meeting.approved_summary
              : "No approved summary was published."}
          </p>
        </CardContent>
      </Card>

      <section className="grid gap-6 lg:grid-cols-3">
        <OutcomeCard
          title="Decisions"
          items={outcomes.filter((item) => item.outcome_type === "decision")}
          emptyLabel="No approved decisions."
        />
        <OutcomeCard
          title="Blockers"
          items={outcomes.filter((item) => item.outcome_type === "blocker")}
          emptyLabel="No approved blockers."
        />
        <OutcomeCard
          title="Unresolved Questions"
          items={outcomes.filter((item) => item.outcome_type === "unresolved_question")}
          emptyLabel="No unresolved questions."
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="heading-section">Official Action Items</CardTitle>
          <CardDescription>
            Approved follow-up actions created from this published meeting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {actionItems.length === 0 ? (
            <p className="text-helper">No official action items were published for this meeting.</p>
          ) : (
            <div className="space-y-3">
              {actionItems.map((action) => (
                <article key={action.id} className="rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="heading-card text-foreground">{action.title}</h3>
                      <p className="mt-1 text-body text-foreground">
                        {action.description ?? "No description."}
                      </p>
                    </div>
                    <Badge variant={action.status === "done" ? "success" : "secondary"}>
                      {actionStatusLabel(action.status)}
                    </Badge>
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <Info label="PIC" value={action.pic_name ?? "Unknown"} />
                    <Info label="Deadline" value={formatActionDeadline(action)} />
                    <Info label="Priority" value={action.priority ? capitalize(action.priority) : "Not Mentioned"} />
                    <Info label="Source reference" value={action.source_reference ?? "Not Mentioned"} />
                  </dl>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function OutcomeCard({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: MeetingOutcome[];
  emptyLabel: string;
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
          <ol className="space-y-3">
            {items.map((item, index) => (
              <li key={item.id} className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium text-foreground">
                  {title.slice(0, -1)} {index + 1}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-body text-foreground">
                  {item.content}
                </p>
                <p className="mt-3 text-helper">
                  Source Reference: {item.source_reference ?? "Not Mentioned"}
                </p>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
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

function formatMeetingDate(meetingDate: string, meetingTime: string | null) {
  if (!meetingTime) {
    return `${dateFormatter.format(new Date(meetingDate))}, Time Not Mentioned`;
  }

  return dateTimeFormatter.format(new Date(`${meetingDate}T${meetingTime}`));
}

function formatActionDeadline(action: OfficialActionItem) {
  if (!action.due_date) {
    return "Not Mentioned";
  }

  if (!action.due_time) {
    return `${dateFormatter.format(new Date(action.due_date))}, Time Not Mentioned`;
  }

  return dateTimeFormatter.format(new Date(`${action.due_date}T${action.due_time}`));
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function actionStatusLabel(status: OfficialActionItem["status"]) {
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
