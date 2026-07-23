"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  createProjectAction,
  type ProjectFormActionState,
} from "../actions";

const initialState: ProjectFormActionState = {
  message: null,
  fieldErrors: {},
};

interface ProjectFormProps {
  projectId?: string;
  initialValues?: {
    name: string;
    description: string;
  };
  submitAction?: (
    previousState: ProjectFormActionState,
    formData: FormData,
  ) => Promise<ProjectFormActionState>;
  submitLabel?: string;
  pendingLabel?: string;
}

export function ProjectForm({
  projectId,
  initialValues = { name: "", description: "" },
  submitAction = createProjectAction,
  submitLabel = "Create project",
  pendingLabel = "Creating project...",
}: ProjectFormProps) {
  const [name, setName] = useState(initialValues.name);
  const [description, setDescription] = useState(initialValues.description);
  const [state, formAction, isPending] = useActionState(
    submitAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      {projectId ? <input type="hidden" name="projectId" value={projectId} /> : null}

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          Project name <span className="text-destructive">*</span>
        </label>
        <Input
          id="name"
          name="name"
          placeholder="Example: Smart Meeting Workspace"
          value={name}
          onChange={(event) => setName(event.target.value)}
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
          value={description}
          onChange={(event) => setDescription(event.target.value)}
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
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
