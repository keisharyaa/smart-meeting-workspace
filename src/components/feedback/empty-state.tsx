import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

/**
 * Shared empty state.
 *
 * Use when a successful query returns no records.
 * Do not use this component for loading or error states.
 */
export function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <section role="status">
      <h2>{title}</h2>
      <p>{description}</p>
      {action ? <div>{action}</div> : null}
    </section>
  );
}