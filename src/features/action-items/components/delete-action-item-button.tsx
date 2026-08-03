"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

import { ConfirmationDialog } from "@/components/feedback/confirmation-dialog";
import { Button } from "@/components/ui/button";

import { deleteActionItemAction } from "../actions";

interface DeleteActionItemButtonProps {
  actionItemId: string;
  title: string;
}

export function DeleteActionItemButton({
  actionItemId,
  title,
}: DeleteActionItemButtonProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  async function removeActionItem() {
    setMessage(null);

    const result = await deleteActionItemAction(actionItemId);

    if (!result.success) {
      setMessage(result.message ?? "We could not delete this action item.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <ConfirmationDialog
        title="Delete action item?"
        description={`"${title}" will be removed from official action item tracking.`}
        confirmLabel="Delete action item"
        destructive
        onConfirm={removeActionItem}
        trigger={
          <Button type="button" variant="destructive" size="sm">
            <Trash2 />
            Delete
          </Button>
        }
      />

      {message ? (
        <p role="alert" className="max-w-56 text-right text-xs text-destructive-foreground">
          {message}
        </p>
      ) : null}
    </div>
  );
}
