import type { Database } from "@/types/database";

export type ReminderActionItem =
  Database["public"]["Tables"]["action_items"]["Row"];
export type ReminderStatus = ReminderActionItem["status"];

export type ReminderCategory = "overdue" | "due_today" | "due_soon";

export interface ReminderRecord {
  actionItem: ReminderActionItem;
  projectName: string;
  category: ReminderCategory;
  deadlineAt: Date;
  deadlineLabel: string;
  isRead: boolean;
}

export interface ReminderSummary {
  overdue: number;
  dueToday: number;
  dueSoon: number;
  unread: number;
}

