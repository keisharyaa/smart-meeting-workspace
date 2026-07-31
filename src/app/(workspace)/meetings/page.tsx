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
          title="No published meetings yet"
          description="Start by adding meeting notes. Draft meetings remain in Human Review until they are approved and published."
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
  const { meeting, projectName, officialActionItemCount } = item;
  const status = meetingStatusPresentation[meeting.status];

  return (
    <Link
      href={`/meetings/${meeting.id}`}
      className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="h-full transition-colors hover:bg-muted/40">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="line-clamp-2">{meeting.title}</CardTitle>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <CardDescription className="line-clamp-3 min-h-[3.75rem]">
            {meeting.approved_summary?.trim()
              ? meeting.approved_summary
              : "No approved summary was published."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <dl className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between gap-3">
              <dt>Project</dt>
              <dd className="text-right text-foreground">{projectName}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt>Date</dt>
              <dd className="text-right text-foreground">
                {dateFormatter.format(new Date(meeting.meeting_date))}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt>Official action items</dt>
              <dd className="text-right text-foreground">
                {officialActionItemCount}
              </dd>
            </div>
          </dl>

          <div className="flex items-center justify-between gap-3 text-caption text-muted-foreground">
            <span>
              Published{" "}
              {meeting.published_at
                ? dateFormatter.format(new Date(meeting.published_at))
                : "Not published"}
            </span>
            <span className={buttonVariants({ variant: "ghost", className: "h-auto px-0 py-0 text-caption" })}>
              View detail
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
