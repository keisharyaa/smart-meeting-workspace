"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  createProjectAction,
  type CreateProjectActionState,
} from "../actions";

const initialState: CreateProjectActionState = {
  message: null,
  fieldErrors: {},
};

export function ProjectForm() {
  const [state, formAction, isPending] = useActionState(
    createProjectAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          Project name <span className="text-destructive">*</span>
        </label>
        <Input
          id="name"
          name="name"
          placeholder="Example: Smart Meeting Workspace"
          required
          aria-invalid={Boolean(state.fieldErrors.name)}
          aria-describedby={state.fieldErrors.name ? "name-error" : undefined}
          disabled={isPending}
        />
        {state.fieldErrors.name ? (
          <p id="name-error" className="text-helper text-destructive">
            {state.fieldErrors.name}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="text-sm font-medium text-foreground"
        >
          Description <span className="text-muted-foreground">(optional)</span>
        </label>
        <Textarea
          id="description"
          name="description"
          placeholder="Describe the purpose or scope of this project."
          disabled={isPending}
        />
      </div>

      {state.message ? (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating project..." : "Create project"}
        </Button>
      </div>
    </form>
  );
}
