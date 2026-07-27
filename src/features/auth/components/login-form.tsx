"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { loginAction, type LoginActionState } from "../actions";

const initialState: LoginActionState = {
  message: null,
  fieldErrors: {},
};

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email address <span className="text-destructive">*</span>
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          disabled={isPending}
          aria-invalid={Boolean(state.fieldErrors.email)}
          aria-describedby={state.fieldErrors.email ? "email-error" : undefined}
        />
        {state.fieldErrors.email ? (
          <p id="email-error" className="text-helper text-destructive">
            {state.fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-foreground"
        >
          Password <span className="text-destructive">*</span>
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          required
          disabled={isPending}
          aria-invalid={Boolean(state.fieldErrors.password)}
          aria-describedby={
            state.fieldErrors.password ? "password-error" : undefined
          }
        />
        {state.fieldErrors.password ? (
          <p id="password-error" className="text-helper text-destructive">
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
        {isPending ? "Signing in..." : "Sign in to workspace"}
      </Button>

      <div className="text-center">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-primary hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Need a workspace account?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:underline"
        >
          Register
        </Link>
      </p>
    </form>
  );
}
