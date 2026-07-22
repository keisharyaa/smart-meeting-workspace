import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  label?: string;
  rows?: number;
  className?: string;
}

/**
 * Shared page-level loading state.
 */
export function LoadingState({
  label = "Loading workspace data...",
  rows = 3,
  className,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        "rounded-lg border border-border bg-card p-5",
        className,
      )}
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-56 max-w-full" />
        </div>
        <Skeleton className="size-9 rounded-md" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: rows }, (_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>

      <span className="sr-only">{label}</span>
    </div>
  );
}
