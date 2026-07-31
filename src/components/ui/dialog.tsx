"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const DialogRoot = AlertDialog.Root;
export const DialogTrigger = AlertDialog.Trigger;
export const DialogClose = AlertDialog.Close;
export const DialogTitle = AlertDialog.Title;
export const DialogDescription = AlertDialog.Description;

export function DialogContent({
  className,
  ...props
}: ComponentProps<typeof AlertDialog.Popup>) {
  return (
    <AlertDialog.Portal>
      <AlertDialog.Backdrop className="fixed inset-0 z-[70] bg-foreground/30" />
      <AlertDialog.Viewport className="fixed inset-0 z-[70] flex items-center justify-center px-4">
        <AlertDialog.Popup
          className={cn(
            "w-full max-w-md rounded-xl border border-border bg-card p-5 text-card-foreground shadow-[var(--shadow-overlay)]",
            className,
          )}
          {...props}
        />
      </AlertDialog.Viewport>
    </AlertDialog.Portal>
  );
}
