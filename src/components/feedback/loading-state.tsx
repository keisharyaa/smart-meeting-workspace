interface LoadingStateProps {
  label?: string;
}

/**
 * Shared loading state.
 *
 * TODO:
 * 1. Replace the basic text with an accessible spinner or skeleton.
 * 2. Keep the label meaningful for screen-reader users.
 * 3. Use page-level loading.tsx files when route-level loading is needed.
 */
export function LoadingState({
  label = "Loading...",
}: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite">
      <p>{label}</p>
    </div>
  );
}