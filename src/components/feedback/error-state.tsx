import type { ReactNode } from "react";

interface ErrorStateProps {
  title?: string;
  message: string;
  action?: ReactNode;
}

/**
 * Shared user-facing error state.
 *
 * TODO:
 * 1. Display only safe error messages.
 * 2. Never expose raw Supabase, Gemini, or stack-trace details.
 * 3. Provide a retry or navigation action when possible.
 */
export function ErrorState({
  title = "Something went wrong",
  message,
  action,
}: ErrorStateProps) {
  return (
    <section role="alert">
      <h2>{title}</h2>
      <p>{message}</p>
      {action ? <div>{action}</div> : null}
    </section>
  );
}