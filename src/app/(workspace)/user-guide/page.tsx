import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { UserGuidePageContent } from "@/features/user-guide/components/user-guide-page-content";

export const metadata = {
  title: "User Guide",
};

export default function UserGuidePage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Workspace"
        title="User Guide"
        description="Learn the complete human-reviewed workflow, understand each workspace module, and recover safely from common problems."
        actions={<Badge variant="info">Read-only guide</Badge>}
      />
      <UserGuidePageContent />
    </PageContainer>
  );
}
