"use client";

import Link from "next/link";

import { ErrorState } from "@/components/feedback/error-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button, buttonVariants } from "@/components/ui/button";

export default function UserGuideError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <PageContainer>
      <PageHeader eyebrow="Workspace" title="User Guide" />
      <ErrorState
        title="We couldn’t open the User Guide"
        message="Please try again. You can also return to Dashboard."
        action={
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={reset}>Retry</Button>
            <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>Back to Dashboard</Link>
          </div>
        }
      />
    </PageContainer>
  );
}
