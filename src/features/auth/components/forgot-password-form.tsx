"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!emailPattern.test(normalizedEmail)) {
      setEmailError("Enter a valid email address.");
      setMessage("Please enter a valid email address.");
      return;
    }

    setEmailError(null);
    setMessage(null);
    setIsPending(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      },
    );

    setIsPending(false);

    if (error) {
      if (
        error.code === "over_email_send_rate_limit" ||
        error.code === "over_request_rate_limit"
      ) {
        setMessage(
          "Too many reset emails have been requested. Please wait a while before trying again.",
        );
        return;
      }

      if (error.message.toLowerCase().includes("redirect")) {
        setMessage(
          "The password reset link is not configured yet. Check the Supabase Redirect URL and try again.",
        );
        return;
      }

      setMessage("We could not send a reset link. Please try again.");
      return;
    }

    setIsComplete(true);
  }

  if (isComplete) {
    return (
      <div className="space-y-5">
        <p
          role="status"
          className="rounded-md border border-success/20 bg-success-background px-4 py-3 text-sm leading-6 text-success-foreground"
        >
          If an account exists for this email, we have sent a password reset link.
        </p>
        <Link
          href="/login"
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
          htmlFor="recoveryEmail"
          className="text-sm font-medium text-foreground"
        >
          Email address <span className="text-destructive">*</span>
        </label>
        <Input
          id="recoveryEmail"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          disabled={isPending}
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? "recovery-email-error" : undefined}
        />
        {emailError ? (
          <p id="recovery-email-error" className="text-helper text-destructive">
            {emailError}
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
        {isPending ? "Sending reset link..." : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Remembered your password?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to Login
        </Link>
      </p>
    </form>
  );
}
