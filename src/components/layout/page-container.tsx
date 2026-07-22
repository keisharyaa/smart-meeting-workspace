import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
}

/**
 * Consistent content wrapper for workspace pages.
 *
 * TODO:
 * 1. Apply shared page width and responsive horizontal spacing.
 * 2. Keep spacing consistent across all workspace routes.
 * 3. Do not add page-specific layout logic here.
 */
export function PageContainer({
  children,
}: PageContainerProps) {
  return <div className="w-full">{children}</div>;
}