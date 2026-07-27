"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  requestEmailChangeAction,
  type EmailChangeActionState,
} from "../actions";

const initialState: EmailChangeActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};

export function EmailChangeForm() {
  const [email, setEmail] = useState("");
  const [state, formAction, isPending] = useActionState(
    requestEmailChangeAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="newEmail" className="text-sm font-medium text-foreground">
          New email address <span className="text-destructive">*</span>
        </label>
        <Input
          id="newEmail"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isPending || state.status === "success"}
          aria-invalid={Boolean(state.fieldErrors.email)}
          aria-describedby="new-email-help new-email-error"
        />
        <p id="new-email-help" className="text-helper">
          For security, confirm the change from both your current and new email address.
        </p>
        {state.fieldErrors.email ? (
          <p id="new-email-error" className="text-helper text-destructive">
            {state.fieldErrors.email}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <p
          role={state.status === "success" ? "status" : "alert"}
          className={
            state.status === "success"
              ? "rounded-md border border-success/20 bg-success-background px-3 py-2 text-sm text-success-foreground"
              : "rounded-md border border-destructive/20 bg-destructive-background px-3 py-2 text-sm text-destructive-foreground"
          }
        >
          {state.message}
        </p>
      ) : null}

      <Button type="submit" variant="outline" disabled={isPending || state.status === "success"}>
        {isPending ? "Sending verification..." : "Send verification email"}
      </Button>
    </form>
  );
}
