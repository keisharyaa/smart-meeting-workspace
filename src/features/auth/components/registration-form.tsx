"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authConfig } from "@/config/auth";

import {
  registerAction,
  type RegistrationActionState,
} from "../actions";

const initialState: RegistrationActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};

export function RegistrationForm() {
  const [fullName, setFullName] = useState("");
  const [currentPosition, setCurrentPosition] = useState("");
  const [email, setEmail] = useState("");
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState,
  );

  if (state.status === "success") {
    return (
      <div className="space-y-5">
        <div
          role="status"
          className="rounded-md border border-success/20 bg-success-background px-4 py-3 text-sm leading-6 text-success-foreground"
        >
          {state.message}
        </div>
        <Link
          href="/login"
          className="inline-flex text-sm font-medium !text-primary hover:underline"
        >
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="fullName"
          className="text-sm font-medium text-foreground"
        >
          Full name <span className="text-destructive">*</span>
        </label>
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
          disabled={isPending}
          aria-invalid={Boolean(state.fieldErrors.fullName)}
          aria-describedby={
            state.fieldErrors.fullName ? "full-name-error" : undefined
          }
        />
        {state.fieldErrors.fullName ? (
          <p id="full-name-error" className="text-helper text-destructive">
            {state.fieldErrors.fullName}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="currentPosition"
          className="text-sm font-medium text-foreground"
        >
          Current position <span className="text-destructive">*</span>
        </label>
        <Input
          id="currentPosition"
          name="currentPosition"
          autoComplete="organization-title"
          placeholder="Example: Digital Product Manager"
          value={currentPosition}
          onChange={(event) => setCurrentPosition(event.target.value)}
          required
          disabled={isPending}
          aria-invalid={Boolean(state.fieldErrors.currentPosition)}
          aria-describedby={
            state.fieldErrors.currentPosition
              ? "current-position-error"
              : undefined
          }
        />
        {state.fieldErrors.currentPosition ? (
          <p
            id="current-position-error"
            className="text-helper text-destructive"
          >
            {state.fieldErrors.currentPosition}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="registrationEmail"
          className="text-sm font-medium text-foreground"
        >
          Email address <span className="text-destructive">*</span>
        </label>
        <Input
          id="registrationEmail"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          disabled={isPending}
          aria-invalid={Boolean(state.fieldErrors.email)}
          aria-describedby={
            state.fieldErrors.email ? "registration-email-error" : undefined
          }
        />
        {state.fieldErrors.email ? (
          <p
            id="registration-email-error"
            className="text-helper text-destructive"
          >
            {state.fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="registrationPassword"
          className="text-sm font-medium text-foreground"
        >
          Password <span className="text-destructive">*</span>
        </label>
        <Input
          id="registrationPassword"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder={`At least ${authConfig.minimumPasswordLength} characters`}
          minLength={authConfig.minimumPasswordLength}
          required
          disabled={isPending}
          aria-invalid={Boolean(state.fieldErrors.password)}
          aria-describedby="password-help registration-password-error"
        />
        <p id="password-help" className="text-helper">
          Use at least {authConfig.minimumPasswordLength} characters.
        </p>
        {state.fieldErrors.password ? (
          <p
            id="registration-password-error"
            className="text-helper text-destructive"
          >
            {state.fieldErrors.password}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/20 bg-destructive-background px-3 py-2 text-sm text-destructive-foreground"
        >
          {state.message}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium !text-primary hover:underline"
        >
          Back to Login
        </Link>
      </p>
    </form>
  );
}
