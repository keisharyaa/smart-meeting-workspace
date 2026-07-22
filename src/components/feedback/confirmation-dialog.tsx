"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface ConfirmationDialogProps {
  title: string;
  description: string;
  trigger: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void | Promise<void>;
  destructive?: boolean;
}

/**
 * Shared confirmation dialog.
 *
 * Feature owners should keep business rules in their service layer
 * and pass only the final action callback to this component.
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
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    try {
      setPending(true);
      await onConfirm?.();
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <span
        onClick={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        role="button"
        tabIndex={0}
        className="inline-flex"
      >
        {trigger}
      </span>

      {open ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmation-dialog-title"
          aria-describedby="confirmation-dialog-description"
        >
          <button
            type="button"
            aria-label="Close confirmation dialog"
            className="absolute inset-0 bg-foreground/30"
            onClick={() => {
              if (!pending) setOpen(false);
            }}
          />

          <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-overlay)]">
            <div className="flex size-10 items-center justify-center rounded-lg bg-warning-background text-warning">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="size-5"
              >
                <path d="M12 3 2.8 19a1.5 1.5 0 0 0 1.3 2.2h15.8a1.5 1.5 0 0 0 1.3-2.2Z" />
                <path d="M12 9v4M12 17h.01" />
              </svg>
            </div>

            <h2
              id="confirmation-dialog-title"
              className="mt-4 text-base font-semibold text-foreground"
            >
              {title}
            </h2>
            <p
              id="confirmation-dialog-description"
              className="mt-2 text-sm leading-6 text-muted-foreground"
            >
              {description}
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                {cancelLabel}
              </Button>
              <Button
                variant={destructive ? "destructive" : "default"}
                onClick={handleConfirm}
                disabled={pending}
              >
                {pending ? "Processing..." : confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
