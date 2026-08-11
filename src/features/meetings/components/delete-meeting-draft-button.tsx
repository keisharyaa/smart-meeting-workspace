"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

import { ConfirmationDialog } from "@/components/feedback/confirmation-dialog";
import { Button } from "@/components/ui/button";

import { deleteMeetingDraftFromListAction } from "../actions";

interface DeleteMeetingDraftButtonProps {
  meetingId: string;
  title: string;
}

export function DeleteMeetingDraftButton({
  meetingId,
  title,
}: DeleteMeetingDraftButtonProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  async function deleteDraft() {
    setMessage(null);

    const result = await deleteMeetingDraftFromListAction(meetingId);

    if (!result.success) {
      setMessage(result.message ?? "We could not delete this draft.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <ConfirmationDialog
        title="Delete draft meeting?"
        description={`"${title}" is still a draft. Deleting it removes the unfinished intake and Human Review progress.`}
        confirmLabel="Delete draft"
        destructive
        onConfirm={deleteDraft}
        trigger={
          <Button type="button" variant="destructive" size="sm">
            <Trash2 />
            Delete draft
          </Button>
        }
      />

      {message ? (
        <p role="alert" className="text-xs text-destructive-foreground">
          {message}
        </p>
      ) : null}
    </div>
  );
}
