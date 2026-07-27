"use server";

import { createClient } from "@/lib/supabase/server";

import {
  cancelMeetingDraft,
  finalizeMeetingDraft,
  prepareMeetingDraft,
} from "./service";
import { MeetingIntakeValidationError } from "./rules";
import type {
  FinalizeMeetingInput,
  MeetingMetadataInput,
} from "./types";

export interface MeetingIntakeActionState {
  success: boolean;
  message: string | null;
  fieldErrors: Record<string, string>;
  meetingId?: string;
  uploads?: Array<{
    originalFileName: string;
    mimeType: string;
    fileSizeBytes: number;
    storagePath: string;
    sourceOrder: number;
    token: string;
  }>;
  reviewPath?: string;
}

const emptyState: MeetingIntakeActionState = {
  success: false,
  message: null,
  fieldErrors: {},
};

export async function prepareMeetingDraftAction(input: {
  metadata: MeetingMetadataInput;
  privacyAccepted: boolean;
  files: Array<{
    originalFileName: string;
    mimeType: string;
    fileSizeBytes: number;
    sourceOrder: number;
  }>;
}): Promise<MeetingIntakeActionState> {
  try {
    if (!input.privacyAccepted) {
      return {
        ...emptyState,
        message: "Please confirm the sensitive-data notice.",
        fieldErrors: {
          privacy:
            "Confirm that the sources are appropriate for this private workspace.",
        },
      };
    }

    const userId = await requireUserId();
    const plan = await prepareMeetingDraft(userId, input.metadata, input.files);

    return {
      ...emptyState,
      success: true,
      meetingId: plan.meetingId,
      uploads: plan.uploads,
    };
  } catch (error) {
    return mapMeetingIntakeError(error);
  }
}

export async function finalizeMeetingDraftAction(
  input: FinalizeMeetingInput,
): Promise<MeetingIntakeActionState> {
  try {
    const userId = await requireUserId();
    const result = await finalizeMeetingDraft(userId, input);

    return {
      ...emptyState,
      success: true,
      meetingId: result.meeting.id,
      reviewPath: `/meetings/${result.meeting.id}/review`,
    };
  } catch (error) {
    return mapMeetingIntakeError(error);
  }
}

export async function cancelMeetingDraftAction(input: {
  meetingId: string;
  storagePaths: string[];
}): Promise<void> {
  try {
    const userId = await requireUserId();
    await cancelMeetingDraft(userId, input.meetingId, input.storagePaths);
  } catch (error) {
    console.error("Unable to cancel meeting draft:", error);
  }
}

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Please sign in before creating a meeting.");
  }

  return user.id;
}

function mapMeetingIntakeError(error: unknown): MeetingIntakeActionState {
  if (error instanceof MeetingIntakeValidationError) {
    return {
      ...emptyState,
      message: error.message,
      fieldErrors: error.fieldErrors,
    };
  }

  console.error("Meeting intake failed:", error);

  return {
    ...emptyState,
    message:
      error instanceof Error
        ? error.message
        : "We could not save the meeting. Please try again.",
    fieldErrors: {},
  };
}
