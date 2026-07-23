"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/feedback/error-state";
import { Button } from "@/components/ui/button";

interface AuthErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AuthErrorPage({
  error,
  reset,
}: AuthErrorPageProps) {
  useEffect(() => {
    console.error("Authentication page failed to load:", error);
  }, [error]);

  return (
    <ErrorState
      title="Unable to load sign in"
      message="We could not load the authentication page. Check your connection and try again."
      action={
        <Button type="button" variant="outline" onClick={reset}>
          Try again
        </Button>
      }
    />
  );
}
