import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

import { listPeopleFromOfficialActionItems } from "../people/repository";
import { listDeadlineReminders } from "../reminders/repository";
import type { ReminderCategory } from "../reminders/types";

type ActionItemRow = Database["public"]["Tables"]["action_items"]["Row"];
type MeetingRow = Database["public"]["Tables"]["meetings"]["Row"];
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

type OpenActionStatus = "todo" | "in_progress" | "blocked";
type DeadlineCondition =
  | "overdue"
  | "red"
  | "yellow"
  | "green"
  | "blue"
  | "done";

export interface DashboardSummary {
  activeProjects: number;
  doneProjects: number;
  publishedMeetings: number;
  processingMeetings: number;
  completedMeetings: number;
  openActions: number;
  dueThisWeekActions: number;
  overdueActions: number;
  completedActions: number;
  unreadReminders: number;
  nearestDeadline: string | null;
}

export interface DashboardProgress {
  todo: number;
  inProgress: number;
  blocked: number;
  done: number;
  totalOfficial: number;
  completionRate: number;
}

export interface DashboardDeadlineDistribution {
  status: ActionItemRow["status"];
  label: string;
  total: number;
  overdue: number;
  dueSoon: number;
  dueInThreeToFiveDays: number;
  dueLater: number;
  notMentioned: number;
  done: number;
}

export interface DashboardRecentMeeting {
  id: string;
  title: string;
  projectName: string;
  status: MeetingRow["status"];
  meetingDate: string;
  publishedAt: string | null;
  officialActionItemCount: number;
  openActionItemCount: number;
  completedActionItemCount: number;
}

export interface DashboardProjectActivity {
  id: string;
  name: string;
  status: ProjectRow["status"];
  updatedAt: string;
  openActionItemCount: number;
  completedActionItemCount: number;
}

export interface DashboardPeopleWorkload {
  key: string;
  fullName: string;
  role: string | null;
  openActionItemCount: number;
  completedActionItemCount: number;
}

export interface DashboardUrgentAction {
  id: string;
  title: string;
  projectName: string;
  status: ActionItemRow["status"];
  category: ReminderCategory;
  deadlineLabel: string;
  isRead: boolean;
}

export interface DashboardMeetingStatusSummary {
  published: number;
  completed: number;
  processing: number;
}

export interface DashboardData {
  ownerName: string;
  timezone: string;
  summary: DashboardSummary;
  progress: DashboardProgress;
  deadlineDistribution: DashboardDeadlineDistribution[];
  meetingStatus: DashboardMeetingStatusSummary;
  recentMeetings: DashboardRecentMeeting[];
  projectActivity: DashboardProjectActivity[];
  peopleWorkload: DashboardPeopleWorkload[];
  urgentActions: DashboardUrgentAction[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Please sign in to view your dashboard.");
  }

  const ownerId = user.id;
  const [
    profileResult,
    projectsResult,
    meetingsResult,
    actionItemsResult,
    people,
    remindersResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, timezone")
      .eq("id", ownerId)
      .maybeSingle<Pick<ProfileRow, "full_name" | "timezone">>(),
    supabase
      .from("projects")
      .select("*")
      .eq("owner_id", ownerId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("meetings")
      .select("*")
      .eq("owner_id", ownerId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("action_items")
      .select("*")
      .eq("owner_id", ownerId)
      .eq("is_official", true)
      .not("published_at", "is", null)
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("due_time", { ascending: true, nullsFirst: true }),
    listPeopleFromOfficialActionItems(ownerId),
    listDeadlineReminders(ownerId),
  ]);

  if (
    profileResult.error ||
    projectsResult.error ||
    meetingsResult.error ||
    actionItemsResult.error
  ) {
    throw new Error("Unable to load dashboard data.");
  }

  const profile = profileResult.data;
  const projects = projectsResult.data ?? [];
  const meetings = meetingsResult.data ?? [];
  const actionItems = actionItemsResult.data ?? [];
  const timezone = remindersResult.timezone || profile?.timezone || "Asia/Jakarta";
  const projectNameById = new Map(
    projects.map((project) => [project.id, project.name]),
  );

  const openActionItems = actionItems.filter(({ status }) =>
    isOpenStatus(status),
  );
  const completedActionItems = actionItems.filter(
    ({ status }) => status === "done",
  );
  const publishedMeetings = meetings.filter(({ is_published }) => is_published);

  const summary: DashboardSummary = {
    activeProjects: projects.filter(({ status }) => status === "active").length,
    doneProjects: projects.filter(({ status }) => status === "done").length,
    publishedMeetings: publishedMeetings.length,
    processingMeetings: publishedMeetings.filter(
      ({ status }) => status === "processing",
    ).length,
    completedMeetings: publishedMeetings.filter(
      ({ status }) => status === "completed",
    ).length,
    openActions: openActionItems.length,
    dueThisWeekActions: countDueThisWeek(openActionItems, timezone),
    overdueActions: remindersResult.summary.overdue,
    completedActions: completedActionItems.length,
    unreadReminders: remindersResult.summary.unread,
    nearestDeadline: getNearestDeadline(openActionItems, timezone),
  };

  return {
    ownerName: profile?.full_name || "Workspace Owner",
    timezone,
    summary,
    progress: buildProgress(actionItems),
    deadlineDistribution: buildDeadlineDistribution(actionItems, timezone),
    meetingStatus: buildMeetingStatus(publishedMeetings),
    recentMeetings: buildRecentMeetings({
      meetings: publishedMeetings,
      actionItems,
      projectNameById,
    }),
    projectActivity: buildProjectActivity({ projects, actionItems }),
    peopleWorkload: people
      .map((person) => ({
        key: person.key,
        fullName: person.fullName,
        role: person.role,
        openActionItemCount: person.openActionItemCount,
        completedActionItemCount: person.completedActionItemCount,
      }))
      .sort((a, b) => b.openActionItemCount - a.openActionItemCount)
      .slice(0, 5),
    urgentActions: remindersResult.reminders.slice(0, 5).map((reminder) => ({
      id: reminder.actionItem.id,
      title: reminder.actionItem.title,
      projectName: reminder.projectName,
      status: reminder.actionItem.status,
      category: reminder.category,
      deadlineLabel: reminder.deadlineLabel,
      isRead: reminder.isRead,
    })),
  };
}

function buildMeetingStatus(meetings: MeetingRow[]): DashboardMeetingStatusSummary {
  return {
    published: meetings.length,
    completed: meetings.filter(({ status }) => status === "completed").length,
    processing: meetings.filter(({ status }) => status === "processing").length,
  };
}

function buildProgress(actionItems: ActionItemRow[]): DashboardProgress {
  const todo = actionItems.filter(({ status }) => status === "todo").length;
  const inProgress = actionItems.filter(
    ({ status }) => status === "in_progress",
  ).length;
  const blocked = actionItems.filter(({ status }) => status === "blocked").length;
  const done = actionItems.filter(({ status }) => status === "done").length;
  const totalOfficial = actionItems.length;

  return {
    todo,
    inProgress,
    blocked,
    done,
    totalOfficial,
    completionRate:
      totalOfficial > 0 ? Math.round((done / totalOfficial) * 100) : 0,
  };
}

function buildDeadlineDistribution(
  actionItems: ActionItemRow[],
  timezone: string,
): DashboardDeadlineDistribution[] {
  const statuses: Array<{
    status: ActionItemRow["status"];
    label: string;
  }> = [
    { status: "todo", label: "To Do" },
    { status: "in_progress", label: "In Progress" },
    { status: "blocked", label: "Blocked" },
    { status: "done", label: "Done" },
  ];

  return statuses.map(({ status, label }) => {
    const statusItems = actionItems.filter(
      (actionItem) => actionItem.status === status,
    );
    const counts = {
      overdue: 0,
      dueSoon: 0,
      dueInThreeToFiveDays: 0,
      dueLater: 0,
      notMentioned: 0,
      done: 0,
    };

    for (const actionItem of statusItems) {
      const condition = getDeadlineCondition(actionItem, timezone);

      if (condition === "overdue") counts.overdue += 1;
      if (condition === "red") counts.dueSoon += 1;
      if (condition === "yellow") counts.dueInThreeToFiveDays += 1;
      if (condition === "green") counts.dueLater += 1;
      if (condition === "blue") counts.notMentioned += 1;
      if (condition === "done") counts.done += 1;
    }

    return {
      status,
      label,
      total: statusItems.length,
      ...counts,
    };
  });
}

function getDeadlineCondition(
  actionItem: ActionItemRow,
  timezone: string,
): DeadlineCondition {
  if (actionItem.status === "done") {
    return "done";
  }

  const deadline = getDeadlineDateTime(actionItem);

  if (!deadline) {
    return "blue";
  }

  const now = getWorkspaceNow(timezone);

  if (deadline.getTime() < now.getTime()) {
    return "overdue";
  }

  const daysUntilDue = Math.ceil(
    (startOfDay(deadline).getTime() - startOfDay(now).getTime()) / 86_400_000,
  );

  if (daysUntilDue <= 2) {
    return "red";
  }

  if (daysUntilDue <= 5) {
    return "yellow";
  }

  return "green";
}

function buildRecentMeetings({
  meetings,
  actionItems,
  projectNameById,
}: {
  meetings: MeetingRow[];
  actionItems: ActionItemRow[];
  projectNameById: Map<string, string>;
}): DashboardRecentMeeting[] {
  const actionItemCountByMeetingId = new Map<string, number>();
  const openActionItemCountByMeetingId = new Map<string, number>();
  const completedActionItemCountByMeetingId = new Map<string, number>();

  for (const actionItem of actionItems) {
    if (!actionItem.meeting_id) {
      continue;
    }

    actionItemCountByMeetingId.set(
      actionItem.meeting_id,
      (actionItemCountByMeetingId.get(actionItem.meeting_id) ?? 0) + 1,
    );

    if (isOpenStatus(actionItem.status)) {
      openActionItemCountByMeetingId.set(
        actionItem.meeting_id,
        (openActionItemCountByMeetingId.get(actionItem.meeting_id) ?? 0) + 1,
      );
    }

    if (actionItem.status === "done") {
      completedActionItemCountByMeetingId.set(
        actionItem.meeting_id,
        (completedActionItemCountByMeetingId.get(actionItem.meeting_id) ?? 0) + 1,
      );
    }
  }

  return meetings
    .sort((a, b) =>
      (b.published_at ?? b.updated_at).localeCompare(a.published_at ?? a.updated_at),
    )
    .slice(0, 5)
    .map((meeting) => ({
      id: meeting.id,
      title: meeting.title,
      projectName: projectNameById.get(meeting.project_id) ?? "Unknown project",
      status: meeting.status,
      meetingDate: meeting.meeting_date,
      publishedAt: meeting.published_at,
      officialActionItemCount: actionItemCountByMeetingId.get(meeting.id) ?? 0,
      openActionItemCount: openActionItemCountByMeetingId.get(meeting.id) ?? 0,
      completedActionItemCount:
        completedActionItemCountByMeetingId.get(meeting.id) ?? 0,
    }));
}

function buildProjectActivity({
  projects,
  actionItems,
}: {
  projects: ProjectRow[];
  actionItems: ActionItemRow[];
}): DashboardProjectActivity[] {
  return projects
    .filter(({ status }) => status !== "archived")
    .slice(0, 5)
    .map((project) => {
      const projectActionItems = actionItems.filter(
        ({ project_id }) => project_id === project.id,
      );

      return {
        id: project.id,
        name: project.name,
        status: project.status,
        updatedAt: project.updated_at,
        openActionItemCount: projectActionItems.filter(({ status }) =>
          isOpenStatus(status),
        ).length,
        completedActionItemCount: projectActionItems.filter(
          ({ status }) => status === "done",
        ).length,
      };
    });
}

function countDueThisWeek(actionItems: ActionItemRow[], timezone: string) {
  const now = getWorkspaceNow(timezone);
  const todayStart = startOfDay(now);
  const endOfWeek = new Date(todayStart);
  const daysUntilSunday = 6 - todayStart.getDay();
  endOfWeek.setDate(todayStart.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);

  return actionItems.filter((actionItem) => {
    const deadline = getDeadlineDateTime(actionItem);

    return (
      deadline &&
      deadline.getTime() >= todayStart.getTime() &&
      deadline.getTime() <= endOfWeek.getTime()
    );
  }).length;
}

function getNearestDeadline(actionItems: ActionItemRow[], timezone: string) {
  const now = getWorkspaceNow(timezone).getTime();
  const nearest = actionItems
    .map(getDeadlineDateTime)
    .filter((deadline): deadline is Date => Boolean(deadline))
    .filter((deadline) => deadline.getTime() >= now)
    .sort((a, b) => a.getTime() - b.getTime())[0];

  return nearest?.toISOString() ?? null;
}

function getDeadlineDateTime(actionItem: ActionItemRow) {
  if (!actionItem.due_date) {
    return null;
  }

  return new Date(`${actionItem.due_date}T${actionItem.due_time ?? "00:00:00"}`);
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

function startOfDay(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

function isOpenStatus(status: ActionItemRow["status"]): status is OpenActionStatus {
  return status === "todo" || status === "in_progress" || status === "blocked";
}
