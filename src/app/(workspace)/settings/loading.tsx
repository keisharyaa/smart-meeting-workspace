import { LoadingState } from "@/components/feedback/loading-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

export default function SettingsLoading() {
  return (
    <PageContainer>
      <PageHeader eyebrow="Account" title="Settings" />
      <LoadingState label="Loading account settings..." rows={2} className="max-w-2xl" />
    </PageContainer>
  );
}
