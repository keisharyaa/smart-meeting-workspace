import Link from "next/link";
import { Plus } from "lucide-react";

import { EmptyState } from "@/components/feedback/empty-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Meetings",
};

export default function MeetingsPage() {
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
    </PageContainer>
  );
}
