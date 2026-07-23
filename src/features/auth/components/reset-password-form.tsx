"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authConfig } from "@/config/auth";
import { createClient } from "@/lib/supabase/client";

type RecoveryStatus = "checking" | "ready" | "invalid";

export function ResetPasswordForm() {
  const router = useRouter();
  const [status, setStatus] = useState<RecoveryStatus>("checking");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const recoveryType = new URLSearchParams(window.location.hash.slice(1)).get(
      "type",
    );
    const supabase = createClient();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY" && session) {
          sessionStorage.setItem("smw-password-recovery", "active");
          setStatus("ready");
        }
      },
    );

    async function checkRecoverySession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const hasRecoverySession =
        recoveryType === "recovery" ||
        sessionStorage.getItem("smw-password-recovery") === "active";

      setStatus(session && hasRecoverySession ? "ready" : "invalid");
    }

    void checkRecoverySession();

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!password) {
      setPasswordError("Password is required.");
      setMessage("Please correct the highlighted field.");
      return;
    }

    if (password.length < authConfig.minimumPasswordLength) {
      setPasswordError(
        `Password must be at least ${authConfig.minimumPasswordLength} characters.`,
      );
      setMessage("Please correct the highlighted field.");
      return;
    }

    setPasswordError(null);
    setMessage(null);
    setIsPending(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setIsPending(false);
      setMessage(
        error.code === "weak_password"
          ? "The password does not meet the configured requirements."
          : "We could not update your password. Your reset link may have expired; request a new link.",
      );
      return;
    }

    sessionStorage.removeItem("smw-password-recovery");
    await supabase.auth.signOut();
    router.replace("/login?message=password_updated");
    router.refresh();
  }

  if (status === "checking") {
    return <p className="text-sm text-muted-foreground">Checking your reset link...</p>;
  }

  if (status === "invalid") {
    return (
      <div className="space-y-5">
        <p
          role="alert"
          className="rounded-md border border-destructive/20 bg-destructive-background px-4 py-3 text-sm leading-6 text-destructive-foreground"
        >
          This password reset link is invalid or has expired. Request a new link.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex text-sm font-medium text-primary hover:underline"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="newPassword"
          className="text-sm font-medium text-foreground"
        >
          New password <span className="text-destructive">*</span>
        </label>
        <Input
          id="newPassword"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder={`At least ${authConfig.minimumPasswordLength} characters`}
          minLength={authConfig.minimumPasswordLength}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          disabled={isPending}
          aria-invalid={Boolean(passwordError)}
          aria-describedby="new-password-help new-password-error"
        />
        <p id="new-password-help" className="text-helper">
          Use at least {authConfig.minimumPasswordLength} characters.
        </p>
        {passwordError ? (
          <p id="new-password-error" className="text-helper text-destructive">
            {passwordError}
          </p>
        ) : null}
      </div>

      {message ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/20 bg-destructive-background px-3 py-2 text-sm text-destructive-foreground"
        >
          {message}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? "Updating password..." : "Update password"}
      </Button>
    </form>
  );
}
