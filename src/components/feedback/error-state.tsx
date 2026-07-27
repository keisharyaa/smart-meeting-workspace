import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Shared user-facing error state.
 *
 * Only pass safe, understandable messages. Raw provider or stack
 * trace details must stay in server logs.
 */
export function ErrorState({
  title = "Something went wrong",
  message,
  action,
  className,
}: ErrorStateProps) {
  return (
    <section
      role="alert"
      className={cn(
        "rounded-lg border border-destructive/20 bg-destructive-background p-5",
        className,
      )}
    >
      <div className="flex gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-destructive shadow-sm">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="size-[1.125rem]"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16.5h.01" />
          </svg>
        </span>

        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-destructive-foreground">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-destructive-foreground/85">
            {message}
          </p>
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </section>
  );
}
