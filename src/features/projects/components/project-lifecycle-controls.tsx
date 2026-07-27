"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmationDialog } from "@/components/feedback/confirmation-dialog";
import { Button } from "@/components/ui/button";

import {
  archiveProjectAction,
  markProjectDoneAction,
  reopenProjectAction,
  restoreProjectAction,
  type ProjectLifecycleActionState,
} from "../actions";
import type { ProjectStatus } from "../types";

interface ProjectLifecycleControlsProps {
  projectId: string;
  status: ProjectStatus;
}

type LifecycleAction = {
  key: "done" | "reopen" | "archive" | "restore";
  label: string;
  title: string;
  description: string;
  confirmLabel: string;
  variant?: "default" | "outline";
};

const actionsByStatus: Record<ProjectStatus, LifecycleAction[]> = {
  active: [
    {
      key: "done",
      label: "Mark as Done",
      title: "Mark project as done?",
      description:
        "This is available only when the project has no unfinished official action items.",
      confirmLabel: "Mark as Done",
    },
    {
      key: "archive",
      label: "Archive",
      title: "Archive project?",
      description: "Archived projects cannot be selected when creating a new meeting.",
      confirmLabel: "Archive project",
      variant: "outline",
    },
  ],
  done: [
    {
      key: "reopen",
      label: "Reopen",
      title: "Reopen project?",
      description: "The project will return to Active and can be used for new meetings.",
      confirmLabel: "Reopen project",
    },
    {
      key: "archive",
      label: "Archive",
      title: "Archive project?",
      description: "Archived projects cannot be selected when creating a new meeting.",
      confirmLabel: "Archive project",
      variant: "outline",
    },
  ],
  archived: [
    {
      key: "restore",
      label: "Restore",
      title: "Restore project?",
      description: "The project will return to Active and can be used for new meetings.",
      confirmLabel: "Restore project",
    },
  ],
};

export function ProjectLifecycleControls({
  projectId,
  status,
}: ProjectLifecycleControlsProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  async function changeLifecycle(action: LifecycleAction["key"]) {
    setMessage(null);

    const lifecycleAction = {
      done: markProjectDoneAction,
      reopen: reopenProjectAction,
      archive: archiveProjectAction,
      restore: restoreProjectAction,
    }[action];
    const result: ProjectLifecycleActionState = await lifecycleAction(projectId);

    if (!result.success) {
      setMessage(result.message ?? "We could not update this project. Please try again.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {actionsByStatus[status].map((action) => (
        <ConfirmationDialog
          key={action.key}
          title={action.title}
          description={action.description}
          confirmLabel={action.confirmLabel}
          onConfirm={() => changeLifecycle(action.key)}
          trigger={<Button variant={action.variant}>{action.label}</Button>}
        />
      ))}

      {message ? (
        <p role="alert" className="w-full text-right text-sm text-destructive-foreground">
          {message}
        </p>
      ) : null}
    </div>
  );
}
