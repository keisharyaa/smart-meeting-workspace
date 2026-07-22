"use client";

import type { ReactNode } from "react";

interface ConfirmationDialogProps {
  title: string;
  description: string;
  trigger: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  destructive?: boolean;
}

/**
 * Shared confirmation dialog contract.
 *
 * TODO:
 * 1. Implement using the approved shadcn/ui AlertDialog component.
 * 2. Require explicit confirmation for delete, archive, publish,
 *    mark-as-done, and other irreversible actions.
 * 3. Support disabled and loading states while the action runs.
 * 4. Keep the dialog open when the operation fails.
 * 5. Do not place feature business logic inside this component.
 */
export function ConfirmationDialog({
  title,
  description,
  trigger,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  destructive = false,
}: ConfirmationDialogProps) {
  void destructive;

  return (
    <div>
      {trigger}

      <div hidden>
        <h2>{title}</h2>
        <p>{description}</p>

        <button type="button">{cancelLabel}</button>

        <button type="button" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}