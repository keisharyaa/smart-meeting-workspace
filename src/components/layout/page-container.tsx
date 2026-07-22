import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Consistent content wrapper for workspace pages.
 *
 * Page-specific routes should use this component instead of
 * defining their own horizontal padding or maximum width.
 */
export function PageContainer({
  children,
  className,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[var(--page-max-width)] px-[var(--page-padding-x)] py-[var(--page-padding-y)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
