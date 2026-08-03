"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  updatePicInformationAction,
  type PicInformationActionState,
} from "../actions";

const initialState: PicInformationActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};

interface EditPicInformationFormProps {
  personKey: string;
  fullName: string;
  email: string;
  role: string;
}

export function EditPicInformationForm({
  personKey,
  fullName: initialFullName,
  email: initialEmail,
  role: initialRole,
}: EditPicInformationFormProps) {
  const [fullName, setFullName] = useState(initialFullName);
  const [email, setEmail] = useState(initialEmail);
  const [role, setRole] = useState(initialRole);
  const [state, formAction, isPending] = useActionState(
    updatePicInformationAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="personKey" value={personKey} />

      <div className="space-y-2">
        <Label htmlFor="picFullName">
          Full name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="picFullName"
          name="fullName"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          disabled={isPending}
          autoComplete="name"
          aria-invalid={Boolean(state.fieldErrors.fullName)}
          aria-describedby={
            state.fieldErrors.fullName ? "pic-full-name-error" : undefined
          }
        />
        {state.fieldErrors.fullName ? (
          <p id="pic-full-name-error" className="text-helper text-destructive">
            {state.fieldErrors.fullName}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="picEmail">Email address</Label>
        <Input
          id="picEmail"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isPending}
          autoComplete="email"
          placeholder="name@example.com"
          aria-invalid={Boolean(state.fieldErrors.email)}
          aria-describedby={state.fieldErrors.email ? "pic-email-error" : undefined}
        />
        {state.fieldErrors.email ? (
          <p id="pic-email-error" className="text-helper text-destructive">
            {state.fieldErrors.email}
          </p>
        ) : (
          <p className="text-helper">Leave blank when email is not mentioned.</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="picRole">Role</Label>
        <Input
          id="picRole"
          name="role"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          disabled={isPending}
          autoComplete="organization-title"
          placeholder="Product Manager"
          aria-invalid={Boolean(state.fieldErrors.role)}
          aria-describedby={state.fieldErrors.role ? "pic-role-error" : undefined}
        />
        {state.fieldErrors.role ? (
          <p id="pic-role-error" className="text-helper text-destructive">
            {state.fieldErrors.role}
          </p>
        ) : (
          <p className="text-helper">Leave blank when role is not mentioned.</p>
        )}
      </div>

      {state.message ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/20 bg-destructive-background px-3 py-2 text-sm text-destructive-foreground"
        >
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving PIC..." : "Save PIC information"}
      </Button>
    </form>
  );
}

