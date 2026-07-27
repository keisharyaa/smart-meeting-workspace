import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
  compact?: boolean;
  className?: string;
}

/**
 * Shared empty state for a successful query with no records.
 */
export function EmptyState({
  title,
  description,
  action,
  icon,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <section
      role="status"
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card text-center",
        compact ? "px-5 py-8" : "min-h-64 px-6 py-12",
        className,
      )}
    >
      <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-secondary text-primary">
        {icon ?? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="size-5"
          >
            <path d="M4 5h16v14H4z" />
            <path d="M8 9h8M8 13h5" />
          </svg>
        )}
      </div>

      <h2 className="heading-section text-foreground">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}
