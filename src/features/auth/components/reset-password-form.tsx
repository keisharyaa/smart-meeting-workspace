"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { authConfig } from "@/config/auth";
import { createClient } from "@/lib/supabase/client";

type RecoveryStatus = "checking" | "ready" | "invalid" | "complete";

export function ResetPasswordForm() {
  const [status, setStatus] = useState<RecoveryStatus>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
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
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const errorCode =
        searchParams.get("error_code") || hashParams.get("error_code");
      const recoveryType = hashParams.get("type");
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const code = searchParams.get("code");

      if (errorCode) {
        sessionStorage.removeItem("smw-password-recovery");
        setStatus("invalid");
        return;
      }

      if (accessToken && refreshToken && recoveryType === "recovery") {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (!error) {
          sessionStorage.setItem("smw-password-recovery", "active");
          window.history.replaceState(null, "", "/reset-password");
          setStatus("ready");
          return;
        }
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
          sessionStorage.setItem("smw-password-recovery", "active");
          window.history.replaceState(null, "", "/reset-password");
          setStatus("ready");
          return;
        }
      }

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

    if (!confirmPassword) {
      setConfirmPasswordError("Confirm your new password.");
      setMessage("Please correct the highlighted fields.");
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("New passwords do not match.");
      setMessage("Please correct the highlighted fields.");
      return;
    }

    setPasswordError(null);
    setConfirmPasswordError(null);
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
    setIsPending(false);
    setStatus("complete");
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

  if (status === "complete") {
    return (
      <div className="space-y-5">
        <p
          role="status"
          className="rounded-md border border-success/20 bg-success-background px-4 py-3 text-sm leading-6 text-success-foreground"
        >
          Your new password has been created successfully. You can now sign in
          to Smart Meeting Workspace with your updated password.
        </p>
        <Link
          href="/login?message=password_updated"
          className="inline-flex text-sm font-medium text-primary hover:underline"
        >
          Back to Login
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
        <PasswordInput
          id="newPassword"
          name="password"
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

      <div className="space-y-2">
        <label
          htmlFor="confirmNewPassword"
          className="text-sm font-medium text-foreground"
        >
          Confirm new password <span className="text-destructive">*</span>
        </label>
        <PasswordInput
          id="confirmNewPassword"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Re-enter your new password"
          minLength={authConfig.minimumPasswordLength}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          disabled={isPending}
          aria-invalid={Boolean(confirmPasswordError)}
          aria-describedby={
            confirmPasswordError ? "confirm-new-password-error" : undefined
          }
        />
        {confirmPasswordError ? (
          <p
            id="confirm-new-password-error"
            className="text-helper text-destructive"
          >
            {confirmPasswordError}
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
        {isPending ? "Creating new password..." : "Create new password"}
      </Button>
    </form>
  );
}
