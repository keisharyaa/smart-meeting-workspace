"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  updateProfileSettingsAction,
  type ProfileSettingsActionState,
} from "../actions";

const initialState: ProfileSettingsActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};

interface ProfileSettingsFormProps {
  fullName: string;
  currentPosition: string;
}

export function ProfileSettingsForm({
  fullName: initialFullName,
  currentPosition: initialCurrentPosition,
}: ProfileSettingsFormProps) {
  const [fullName, setFullName] = useState(initialFullName);
  const [currentPosition, setCurrentPosition] = useState(initialCurrentPosition);
  const [state, formAction, isPending] = useActionState(
    updateProfileSettingsAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="settingsFullName" className="text-sm font-medium text-foreground">
          Full name <span className="text-destructive">*</span>
        </label>
        <Input
          id="settingsFullName"
          name="fullName"
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          disabled={isPending}
          aria-invalid={Boolean(state.fieldErrors.fullName)}
          aria-describedby={state.fieldErrors.fullName ? "settings-full-name-error" : undefined}
        />
        {state.fieldErrors.fullName ? (
          <p id="settings-full-name-error" className="text-helper text-destructive">
            {state.fieldErrors.fullName}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="settingsCurrentPosition" className="text-sm font-medium text-foreground">
          Current position <span className="text-destructive">*</span>
        </label>
        <Input
          id="settingsCurrentPosition"
          name="currentPosition"
          autoComplete="organization-title"
          value={currentPosition}
          onChange={(event) => setCurrentPosition(event.target.value)}
          disabled={isPending}
          aria-invalid={Boolean(state.fieldErrors.currentPosition)}
          aria-describedby={
            state.fieldErrors.currentPosition ? "settings-current-position-error" : undefined
          }
        />
        {state.fieldErrors.currentPosition ? (
          <p id="settings-current-position-error" className="text-helper text-destructive">
            {state.fieldErrors.currentPosition}
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

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving profile..." : "Save profile"}
      </Button>
    </form>
  );
}
