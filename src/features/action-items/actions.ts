"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import {
  deleteActionItemRecord,
  insertManualActionItem,
  syncMeetingStatusFromActions,
  updateActionItemRecord,
  updateActionStatus,
} from "./repository";
import type { ActionItemFormInput, ActionItemPriority, ActionItemStatus } from "./types";

const statuses: ActionItemStatus[] = ["todo", "in_progress", "blocked", "done"];
const priorities: NonNullable<ActionItemPriority>[] = ["low", "medium", "high"];

export async function createManualActionItemAction(
  formData: FormData,
): Promise<void> {
  const input = parseActionItemForm(formData, { requireProject: true });
  const userId = await getCurrentUserId();

  await insertManualActionItem(userId, input);
  revalidateActionItemPages();
  redirect(getSafeReturnTo(formData));
}

export async function updateActionItemAction(formData: FormData): Promise<void> {
  const actionItemId = requireUuid(String(formData.get("actionItemId") ?? ""));
  const input = parseActionItemForm(formData, { requireProject: false });
  const userId = await getCurrentUserId();

  const actionItem = await updateActionItemRecord(userId, actionItemId, input);
  await syncMeetingStatusFromActions(userId, actionItem?.meeting_id ?? null);
  revalidateActionItemPages(actionItem?.meeting_id ?? null);
  redirect(getSafeReturnTo(formData));
}

export async function updateActionItemStatusAction(
  formData: FormData,
): Promise<void> {
  const actionItemId = requireUuid(String(formData.get("actionItemId") ?? ""));
  const status = parseStatus(String(formData.get("status") ?? ""));
  const userId = await getCurrentUserId();

  const actionItem = await updateActionStatus(userId, actionItemId, status);
  await syncMeetingStatusFromActions(userId, actionItem?.meeting_id ?? null);
  revalidateActionItemPages(actionItem?.meeting_id ?? null);
  redirect(getSafeReturnTo(formData));
}

export async function deleteActionItemAction(actionItemId: string): Promise<{
  success: boolean;
  message: string | null;
}> {
  try {
    const userId = await getCurrentUserId();
    const actionItem = await deleteActionItemRecord(userId, requireUuid(actionItemId));

    await syncMeetingStatusFromActions(userId, actionItem?.meeting_id ?? null);
    revalidateActionItemPages(actionItem?.meeting_id ?? null);

    return { success: true, message: null };
  } catch (error) {
    console.error("Unable to delete action item:", error);

    return {
      success: false,
      message: "We could not delete this action item. Please try again.",
    };
  }
}

async function getCurrentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Please sign in before changing action items.");
  }

  return user.id;
}

function parseActionItemForm(
  formData: FormData,
  { requireProject }: { requireProject: boolean },
): ActionItemFormInput {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const picName = String(formData.get("picName") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  const dueTime = String(formData.get("dueTime") ?? "").trim();
  const safeDueTime = dueDate ? dueTime : "";
  const priority = parsePriority(String(formData.get("priority") ?? ""));
  const status = parseStatus(String(formData.get("status") ?? "todo"));

  if (requireProject) {
    requireUuid(projectId);
  }

  if (!title) {
    throw new Error("Action item title is required.");
  }

  return {
    projectId,
    title,
    description,
    picName,
    dueDate,
    dueTime: safeDueTime,
    priority,
    status,
  };
}

function parseStatus(value: string): ActionItemStatus {
  if (statuses.includes(value as ActionItemStatus)) {
    return value as ActionItemStatus;
  }

  throw new Error("Invalid action item status.");
}

function parsePriority(value: string): ActionItemPriority {
  if (!value) return null;

  if (priorities.includes(value as NonNullable<ActionItemPriority>)) {
    return value as ActionItemPriority;
  }

  throw new Error("Invalid action item priority.");
}

function requireUuid(value: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new Error("This action item is not available.");
  }

  return value;
}

function revalidateActionItemPages(meetingId?: string | null) {
  revalidatePath("/action-items");
  revalidatePath("/dashboard");
  revalidatePath("/reminders");

  if (meetingId) {
    revalidatePath(`/meetings/${meetingId}`);
  }
}

function getSafeReturnTo(formData: FormData) {
  const returnTo = String(formData.get("returnTo") ?? "");

  if (returnTo.startsWith("/action-items")) {
    return returnTo;
  }

  return "/action-items";
}
