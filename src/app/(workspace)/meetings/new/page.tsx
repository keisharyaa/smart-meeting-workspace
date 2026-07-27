import Link from "next/link";

import { MeetingIntakeForm } from "@/components/meetings/meeting-intake-form";
import { ErrorState } from "@/components/feedback/error-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getCurrentUserActiveProjects } from "@/features/meetings/queries";
export const dynamic = "force-dynamic"; 
export const metadata = {
  title: "New Meeting",
};

export default async function NewMeetingPage() {
  const { projects, error } = await getCurrentUserActiveProjects();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Meetings"
        title="Add meeting notes"
        description="Capture meeting context and preserve every original source before continuing to Human Review."
        actions={
          <Button variant="outline" render={<Link href="/meetings" />}>
            Back to Meetings
          </Button>
        }
      />

      {error ? (
        <ErrorState message={error} />
      ) : projects.length === 0 ? (
        <ErrorState
          title="An active project is required"
          message="Create or restore an Active project before adding a meeting."
          action={
            <Button render={<Link href="/projects/new" />}>
              Create Project
            </Button>
          }
        />
      ) : (
        <MeetingIntakeForm projects={projects} />
      )}
    </PageContainer>
  );
}
