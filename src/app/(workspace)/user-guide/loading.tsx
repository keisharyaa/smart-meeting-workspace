import { LoadingState } from "@/components/feedback/loading-state";
import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserGuideLoading() {
  return (
    <PageContainer>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <LoadingState label="Opening the User Guide..." rows={5} />
    </PageContainer>
  );
}
