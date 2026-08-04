import { createClient } from "@/lib/supabase/server";

import { listDeadlineReminders } from "./repository";
import type { ReminderRecord, ReminderSummary } from "./types";

export interface RemindersPageData {
  reminders: ReminderRecord[];
  summary: ReminderSummary;
  timezone: string;
  error: string | null;
}

export async function getCurrentUserReminders(): Promise<RemindersPageData> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        reminders: [],
        summary: emptySummary(),
        timezone: "Asia/Jakarta",
        error: "Please sign in to view reminders.",
      };
    }

    const data = await listDeadlineReminders(user.id);

    return {
      ...data,
      error: null,
    };
  } catch (error) {
    console.error("Unable to load reminders:", error);

    return {
      reminders: [],
      summary: emptySummary(),
      timezone: "Asia/Jakarta",
      error: "We could not load reminders. Please try again.",
    };
  }
}

function emptySummary(): ReminderSummary {
  return {
    overdue: 0,
    dueToday: 0,
    dueSoon: 0,
    unread: 0,
  };
}

