import { createClient } from "@/lib/supabase/server";

import type {
  ReminderActionItem,
  ReminderCategory,
  ReminderRecord,
  ReminderSummary,
} from "./types";

const reminderNotificationType = "deadline_reminder";
const unfinishedStatuses = ["todo", "in_progress", "blocked"] as const;

type NotificationRow = {
  action_item_id: string;
  is_read: boolean;
  read_at: string | null;
};

type ProfileRow = {
  timezone: string;
};

export async function listDeadlineReminders(ownerId: string): Promise<{
  reminders: ReminderRecord[];
  summary: ReminderSummary;
  timezone: string;
}> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", ownerId)
    .maybeSingle<ProfileRow>();
  const timezone = profile?.timezone || "Asia/Jakarta";

  const { data: actionItems, error } = await supabase
    .from("action_items")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("is_official", true)
    .not("published_at", "is", null)
    .not("due_date", "is", null)
    .in("status", unfinishedStatuses)
    .order("due_date", { ascending: true })
    .order("due_time", { ascending: true, nullsFirst: true });

  if (error) {
    throw new Error("Unable to load reminders.");
  }

  if (!actionItems || actionItems.length === 0) {
    return {
      reminders: [],
      summary: emptySummary(),
      timezone,
    };
  }

  const actionItemIds = actionItems.map((actionItem) => actionItem.id);
  const projectIds = [...new Set(actionItems.map((actionItem) => actionItem.project_id))];

  const [
    { data: projects, error: projectsError },
    { data: notifications, error: notificationsError },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name")
      .eq("owner_id", ownerId)
      .in("id", projectIds),
    supabase
      .from("notifications")
      .select("action_item_id, is_read, read_at")
      .eq("owner_id", ownerId)
      .eq("notification_type", reminderNotificationType)
      .in("action_item_id", actionItemIds),
  ]);

  if (projectsError || notificationsError) {
    throw new Error("Unable to load reminder context.");
  }

  const projectNameById = new Map(
    (projects ?? []).map((project) => [project.id, project.name]),
  );
  const readStateByActionItemId = buildReadStateByActionItemId(
    notifications ?? [],
  );
  const reminders = actionItems
    .map((actionItem) =>
      buildReminderRecord({
        actionItem,
        projectName:
          projectNameById.get(actionItem.project_id) ?? "Unknown project",
        isRead: readStateByActionItemId.get(actionItem.id) ?? false,
        timezone,
      }),
    )
    .filter((reminder): reminder is ReminderRecord => Boolean(reminder))
    .sort(sortReminders);

  return {
    reminders,
    summary: summarizeReminders(reminders),
    timezone,
  };
}

export async function markReminderRead(
  ownerId: string,
  actionItemId: string,
): Promise<ReminderActionItem | null> {
  const supabase = await createClient();
  const { data: actionItem, error: actionItemError } = await supabase
    .from("action_items")
    .select("*")
    .eq("id", actionItemId)
    .eq("owner_id", ownerId)
    .eq("is_official", true)
    .not("published_at", "is", null)
    .not("due_date", "is", null)
    .in("status", unfinishedStatuses)
    .maybeSingle();

  if (actionItemError) {
    throw new Error("Unable to open this reminder.");
  }

  if (!actionItem) {
    return null;
  }

  const readAt = new Date().toISOString();
  const { data: updatedNotifications, error: updateError } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: readAt,
    })
    .eq("owner_id", ownerId)
    .eq("action_item_id", actionItemId)
    .eq("notification_type", reminderNotificationType)
    .select("id");

  if (updateError) {
    throw new Error("Unable to mark this reminder as read.");
  }

  if ((updatedNotifications ?? []).length === 0) {
    const { error: insertError } = await supabase.from("notifications").insert({
      owner_id: ownerId,
      action_item_id: actionItemId,
      notification_type: reminderNotificationType,
      title: actionItem.title,
      message: "Deadline reminder was opened.",
      is_read: true,
      read_at: readAt,
    });

    if (insertError) {
      throw new Error("Unable to save this reminder read state.");
    }
  }

  return actionItem;
}

export async function markRemindersRead(
  ownerId: string,
  actionItemIds: string[],
): Promise<void> {
  const uniqueActionItemIds = [...new Set(actionItemIds)];

  await Promise.all(
    uniqueActionItemIds.map(async (actionItemId) => {
      await markReminderRead(ownerId, actionItemId);
    }),
  );
}

function buildReminderRecord({
  actionItem,
  projectName,
  isRead,
  timezone,
}: {
  actionItem: ReminderActionItem;
  projectName: string;
  isRead: boolean;
  timezone: string;
}): ReminderRecord | null {
  if (!actionItem.due_date) {
    return null;
  }

  const deadlineAt = getDeadlineDateTime(actionItem);
  const now = getWorkspaceNow(timezone);
  const category = getReminderCategory(deadlineAt, now);

  if (!category) {
    return null;
  }

  return {
    actionItem,
    projectName,
    category,
    deadlineAt,
    deadlineLabel: formatDeadline(actionItem),
    isRead,
  };
}

function getReminderCategory(
  deadlineAt: Date,
  now: Date,
): ReminderCategory | null {
  if (deadlineAt.getTime() < now.getTime()) {
    return "overdue";
  }

  const dueDate = toDateKey(deadlineAt);
  const today = toDateKey(now);

  if (dueDate === today) {
    return "due_today";
  }

  const daysUntilDue = Math.ceil(
    (startOfDay(deadlineAt).getTime() - startOfDay(now).getTime()) /
      86_400_000,
  );

  if (daysUntilDue >= 1 && daysUntilDue <= 3) {
    return "due_soon";
  }

  return null;
}

function getWorkspaceNow(timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const valueByType = new Map(parts.map((part) => [part.type, part.value]));

  return new Date(
    Number(valueByType.get("year")),
    Number(valueByType.get("month")) - 1,
    Number(valueByType.get("day")),
    Number(valueByType.get("hour")),
    Number(valueByType.get("minute")),
    Number(valueByType.get("second")),
  );
}

function getDeadlineDateTime(actionItem: ReminderActionItem) {
  return new Date(
    `${actionItem.due_date}T${actionItem.due_time || "00:00:00"}`,
  );
}

function formatDeadline(actionItem: ReminderActionItem) {
  const dateFormatter = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  });

  if (!actionItem.due_date) {
    return "Not Mentioned";
  }

  const date = dateFormatter.format(
    new Date(`${actionItem.due_date}T00:00:00`),
  );

  return actionItem.due_time ? `${date}, ${actionItem.due_time}` : `${date}, 00:00`;
}

function buildReadStateByActionItemId(notifications: NotificationRow[]) {
  const readStateByActionItemId = new Map<string, boolean>();

  for (const notification of notifications) {
    const existing = readStateByActionItemId.get(notification.action_item_id);

    readStateByActionItemId.set(
      notification.action_item_id,
      Boolean(existing || notification.is_read),
    );
  }

  return readStateByActionItemId;
}

function summarizeReminders(reminders: ReminderRecord[]): ReminderSummary {
  return reminders.reduce(
    (summary, reminder) => {
      if (reminder.category === "overdue") summary.overdue += 1;
      if (reminder.category === "due_today") summary.dueToday += 1;
      if (reminder.category === "due_soon") summary.dueSoon += 1;
      if (!reminder.isRead) summary.unread += 1;

      return summary;
    },
    emptySummary(),
  );
}

function emptySummary(): ReminderSummary {
  return {
    overdue: 0,
    dueToday: 0,
    dueSoon: 0,
    unread: 0,
  };
}

function sortReminders(a: ReminderRecord, b: ReminderRecord) {
  const categoryOrder: Record<ReminderCategory, number> = {
    overdue: 0,
    due_today: 1,
    due_soon: 2,
  };

  return (
    categoryOrder[a.category] - categoryOrder[b.category] ||
    a.deadlineAt.getTime() - b.deadlineAt.getTime()
  );
}

function toDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
