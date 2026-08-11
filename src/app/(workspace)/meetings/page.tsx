import Link from "next/link";
import { Plus } from "lucide-react";

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
import { getCurrentUserPublishedMeetings } from "@/features/meetings/queries";
import { DeleteMeetingDraftButton } from "@/features/meetings/components/delete-meeting-draft-button";
import type { Meeting, PublishedMeetingListItem } from "@/features/meetings/types";

export const metadata = {
  title: "Meetings",
};

export const dynamic = "force-dynamic";

const meetingStatusPresentation: Record<
  Meeting["status"],
  { label: string; variant: "outline" | "warning" | "success" }
> = {
  draft: { label: "Draft", variant: "outline" },
  processing: { label: "Processing", variant: "warning" },
  completed: { label: "Completed", variant: "success" },
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

export default async function MeetingsPage() {
  const { meetings, error } = await getCurrentUserPublishedMeetings();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Workspace"
        title="Meetings"
        description="Capture meeting notes, review structured outcomes, and preserve approved meeting records."
        actions={
          <Button render={<Link href="/meetings/new" />}>
            <Plus />
            New Meeting
          </Button>
        }
      />

      {error ? (
        <ErrorState title="Meetings are unavailable" message={error} />
      ) : meetings.length === 0 ? (
        <EmptyState
          title="No meetings yet"
          description="Start by adding meeting notes. Draft meetings will appear here until they are approved and published."
          action={
            <Button render={<Link href="/meetings/new" />}>
              <Plus />
              Add Meeting Notes
            </Button>
          }
        />
      ) : (
        <section
          aria-label="Meeting list"
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {meetings.map((item) => (
            <MeetingRecordCard key={item.meeting.id} item={item} />
          ))}
        </section>
      )}
    </PageContainer>
  );
}

function MeetingRecordCard({ item }: { item: PublishedMeetingListItem }) {
  const { meeting, projectName, projectStatus, officialActionItemCount } = item;
  const status = meetingStatusPresentation[meeting.status];
  const isArchivedProject = projectStatus === "archived";
  const isDraft = !meeting.is_published;
  const meetingHref = isDraft
    ? `/meetings/${meeting.id}/review`
    : `/meetings/${meeting.id}`;

  return (
    <Card className="flex h-full flex-col transition-colors hover:bg-muted/40">
      <CardHeader>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {isArchivedProject ? (
              <Badge
                variant="outline"
                className="border-muted-foreground/30 bg-muted text-muted-foreground"
              >
                Archived Project
              </Badge>
            ) : null}
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <CardTitle className="line-clamp-2">{meeting.title}</CardTitle>
        </div>
        <CardDescription className="line-clamp-3 min-h-[3.75rem]">
          {isDraft
            ? "This meeting is still a draft. Continue Human Review to finish and publish it, or delete it if it is no longer needed."
            : meeting.approved_summary?.trim()
              ? meeting.approved_summary
              : "No approved summary was published."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <dl className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center justify-between gap-3">
            <dt>Project</dt>
            <dd className="max-w-[65%] text-right text-foreground">
              <span className="break-words">{projectName}</span>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt>Date</dt>
            <dd className="text-right text-foreground">
              {dateFormatter.format(new Date(meeting.meeting_date))}
            </dd>
          </div>
          {isDraft ? (
            <div className="flex items-center justify-between gap-3">
              <dt>Progress</dt>
              <dd className="text-right text-foreground">Needs review</dd>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <dt>Official action items</dt>
              <dd className="text-right text-foreground">
                {officialActionItemCount}
              </dd>
            </div>
          )}
        </dl>

        <div className="space-y-3">
          <div className="text-caption text-muted-foreground">
            <span>
              {isDraft ? (
                <>Updated {dateFormatter.format(new Date(meeting.updated_at))}</>
              ) : (
                <>
                  Published{" "}
                  {meeting.published_at
                    ? dateFormatter.format(new Date(meeting.published_at))
                    : "Not published"}
                </>
              )}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={meetingHref}
              className={buttonVariants({
                variant: isDraft ? "default" : "outline",
                size: "sm",
              })}
            >
              {isDraft ? "Continue review" : "View detail"}
            </Link>

            {isDraft ? (
              <DeleteMeetingDraftButton
                meetingId={meeting.id}
                title={meeting.title}
              />
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
