"use client";

import type { ReactElement } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ConfirmationDialogProps {
  title: string;
  description: string;
  trigger: ReactElement;
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
    <DialogRoot
      open={open}
      onOpenChange={(nextOpen) => {
        if (!pending) setOpen(nextOpen);
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent>
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

            <DialogTitle className="mt-4 text-base font-semibold text-foreground">
              {title}
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </DialogDescription>

            <div className="mt-6 flex justify-end gap-2">
              <DialogClose
                render={<Button variant="outline" disabled={pending} />}
              >
                {cancelLabel}
              </DialogClose>
              <Button
                type="button"
                variant={destructive ? "destructive" : "default"}
                onClick={handleConfirm}
                disabled={pending}
              >
                {pending ? "Processing..." : confirmLabel}
              </Button>
            </div>
      </DialogContent>
    </DialogRoot>
  );
}
