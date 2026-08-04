"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { markReminderRead } from "./repository";

export async function openReminderAction(formData: FormData): Promise<void> {
  const actionItemId = String(formData.get("actionItemId") ?? "").trim();
  const userId = await getCurrentUserId();

  if (!isUuid(actionItemId)) {
    redirect("/reminders?error=action-unavailable");
  }

  const actionItem = await markReminderRead(userId, actionItemId);

  if (!actionItem) {
    redirect("/reminders?error=action-unavailable");
  }

  revalidatePath("/reminders");
  revalidatePath("/action-items");
  redirect(`/action-items?q=${encodeURIComponent(actionItem.title)}`);
}

export async function markReminderMessageReadAction(
  actionItemId: string,
): Promise<boolean> {
  const normalizedActionItemId = actionItemId.trim();

  if (!isUuid(normalizedActionItemId)) {
    return false;
  }

  const userId = await getCurrentUserId();
  const actionItem = await markReminderRead(userId, normalizedActionItemId);
  revalidatePath("/reminders");

  return Boolean(actionItem);
}

async function getCurrentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Please sign in before opening reminders.");
  }

  return user.id;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
