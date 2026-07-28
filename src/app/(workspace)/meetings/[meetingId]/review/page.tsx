import Link from "next/link";
import { notFound } from "next/navigation";
import { ErrorState } from "@/components/feedback/error-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { HumanReviewWorkspace } from "@/components/meetings/human-review-workspace";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUserMeetingDraft } from "@/features/meetings/review-queries";

interface MeetingReviewPageProps {
  params: Promise<{ meetingId: string }>;
}

export default async function MeetingReviewPage({
  params,
}: MeetingReviewPageProps) {
  const { meetingId } = await params;
  const { data, error } = await getCurrentUserMeetingDraft(meetingId);

  if (error) {
    return (
      <PageContainer>
        <ErrorState
          title="Original Meeting Notes could not be loaded"
          message={`${error} The meeting draft was not changed.`}
          action={
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/meetings/${meetingId}/review`}
                className={buttonVariants({ variant: "outline" })}
              >
                Reload Original Notes
              </Link>
              <Link
                href="/meetings"
                className={buttonVariants({ variant: "secondary" })}
              >
                Return to Meetings
              </Link>
            </div>
          }
        />
      </PageContainer>
    );
  }

  if (!data) {
    notFound();
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Meetings"
        title="Human Review"
        description="Review and edit the meeting outcomes before saving the draft."
        actions={<Badge variant="secondary">Draft</Badge>}
      />
      <HumanReviewWorkspace
        meeting={data.meeting}
        sources={data.sources}
        projectName={data.projectName}
        initialDraft={data.reviewDraft}
      />
    </PageContainer>
  );
}
