import {
  ArrowRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Flame,
  Inbox,
  MailOpen,
  MessageCircleHeart,
  Siren,
  X,
} from "lucide-react";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { openReminderAction } from "@/features/reminders/actions";
import { ReminderMessageLink } from "@/features/reminders/components/reminder-message-link";
import { getCurrentUserReminders } from "@/features/reminders/queries";
import type {
  ReminderCategory,
  ReminderRecord,
  ReminderStatus,
} from "@/features/reminders/types";

export const metadata = {
  title: "Reminders",
};

export const dynamic = "force-dynamic";

type ReminderFilter = "all" | "unread" | ReminderCategory;

interface RemindersPageProps {
  searchParams: Promise<{
    error?: string;
    filter?: string;
    reminder?: string;
  }>;
}

const reminderCategories: Array<{
  category: ReminderCategory;
  title: string;
  description: string;
  icon: typeof Siren;
  className: string;
  badgeClassName: string;
}> = [
  {
    category: "overdue",
    title: "Overdue",
    description: "Needs immediate follow-up.",
    icon: Siren,
    className: "border-[#5B3418]/35 bg-[#5B3418]/5",
    badgeClassName: "border-[#5B3418] bg-[#5B3418]/10 text-[#5B3418]",
  },
  {
    category: "due_today",
    title: "Due Today",
    description: "Perfect day to wrap it up.",
    icon: Flame,
    className: "border-destructive/30 bg-destructive-background/60",
    badgeClassName: "border-destructive bg-destructive/10 text-destructive",
  },
  {
    category: "due_soon",
    title: "Due Soon",
    description: "Still time to follow up calmly.",
    icon: Clock3,
    className: "border-warning/30 bg-warning-background/60",
    badgeClassName: "border-warning bg-warning/10 text-warning-foreground",
  },
];

const statusLabels: Record<ReminderStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  blocked: "Blocked",
  done: "Done",
};

const filterOptions: Array<{ label: string; value: ReminderFilter }> = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Overdue", value: "overdue" },
  { label: "Due Today", value: "due_today" },
  { label: "Due Soon", value: "due_soon" },
];

export default async function RemindersPage({
  searchParams,
}: RemindersPageProps) {
  const params = await searchParams;
  const { reminders, summary, timezone, error } = await getCurrentUserReminders();
  const filter = normalizeFilter(params.filter);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Workspace"
        title="Reminders"
        description="Prioritize official unfinished action items that are overdue, due today, or due soon."
      />

      <div className="space-y-6">
        {params.error === "action-unavailable" ? (
          <ErrorState
            title="Reminder action is unavailable"
            message="This action item may have been completed, deleted, or moved outside your workspace."
          />
        ) : null}

        {error ? (
          <ErrorState
            title="Reminders are unavailable"
            message={error}
            action={
              <Button render={<a href="/reminders" />} variant="outline">
                Retry
              </Button>
            }
          />
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <SummaryCard
                label="Unread"
                value={summary.unread}
                description="Needs your attention"
                icon={Bell}
              />
              <SummaryCard
                label="Overdue"
                value={summary.overdue}
                description="Deadline already passed"
                icon={Siren}
              />
              <SummaryCard
                label="Due Today"
                value={summary.dueToday}
                description="Must be handled today"
                icon={Flame}
              />
              <SummaryCard
                label="Due Soon"
                value={summary.dueSoon}
                description="Within the next 3 days"
                icon={CalendarClock}
              />
            </section>

            <Card className="border-primary/20 bg-secondary/30">
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Timezone rule
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Reminder categories are calculated using your workspace
                    timezone: <span className="font-medium">{timezone}</span>.
                    Done actions and actions without deadlines are excluded.
                  </p>
                </div>
                <Badge variant="info">Official unfinished actions only</Badge>
              </CardContent>
            </Card>

            {reminders.length === 0 ? (
              <EmptyState
                title="No active reminders"
                description="You do not have official unfinished action items that are overdue, due today, or due within the next 3 days."
                icon={<Inbox className="size-5" aria-hidden="true" />}
              />
            ) : (
              <ReminderInbox
                filter={filter}
                reminders={reminders}
                selectedReminderId={params.reminder}
              />
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}

function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: number;
  description: string;
  icon: typeof Bell;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-caption text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
          <p className="text-helper">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ReminderInbox({
  reminders,
  filter,
  selectedReminderId,
}: {
  reminders: ReminderRecord[];
  filter: ReminderFilter;
  selectedReminderId?: string;
}) {
  const filteredReminders = filterReminders(reminders, filter);
  const sortedReminders = [...filteredReminders].sort((first, second) => {
    return second.deadlineAt.getTime() - first.deadlineAt.getTime();
  });
  const selectedReminder = sortedReminders.find((reminder) => {
      return reminder.actionItem.id === selectedReminderId;
    });
  const groupedReminders = groupRemindersByTime(sortedReminders);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 heading-section">
              <MailOpen className="size-4 text-primary" aria-hidden="true" />
              Reminder inbox
            </CardTitle>
            <CardDescription>
              Select a reminder on the left, then read the full follow-up
              message on the right.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                render={<a href={`/reminders?filter=${option.value}`} />}
                size="sm"
                variant={filter === option.value ? "default" : "outline"}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      {sortedReminders.length === 0 ? (
        <CardContent className="p-6">
          <EmptyState
            title="No reminders match this filter"
            description="Try another filter to see more reminder messages."
            icon={<Inbox className="size-5" aria-hidden="true" />}
          />
        </CardContent>
      ) : (
        <div
          className={
            selectedReminder
              ? "grid min-h-[620px] lg:grid-cols-[380px_minmax(0,1fr)]"
              : "min-h-[620px]"
          }
        >
          <aside
            className={
              selectedReminder
                ? "border-b border-border bg-muted/20 lg:border-b-0 lg:border-r"
                : "bg-muted/20"
            }
          >
            <div className="max-h-[620px] overflow-y-auto">
              {groupedReminders.map((group) => (
                <details key={group.title} className="group" open>
                  <summary className="sticky top-0 z-10 flex cursor-pointer list-none items-center justify-between border-b border-border bg-muted/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground backdrop-blur marker:hidden">
                    <span className="flex items-center gap-2">
                      <ChevronDown
                        className="-rotate-90 size-3.5 transition group-open:rotate-0"
                        aria-hidden="true"
                      />
                      {group.title}
                    </span>
                    <span className="rounded-full bg-card px-2 py-0.5 text-[0.625rem] font-semibold text-muted-foreground">
                      {group.reminders.length}
                    </span>
                  </summary>
                  <div className="divide-y divide-border">
                    {group.reminders.map((reminder) => (
                      <ReminderListItem
                        key={reminder.actionItem.id}
                        filter={filter}
                        isSelected={
                          reminder.actionItem.id === selectedReminder?.actionItem.id
                        }
                        reminder={reminder}
                      />
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </aside>

          {selectedReminder ? (
            <ReminderReadingPane filter={filter} reminder={selectedReminder} />
          ) : null}
        </div>
      )}
    </Card>
  );
}

function ReminderListItem({
  reminder,
  filter,
  isSelected,
}: {
  reminder: ReminderRecord;
  filter: ReminderFilter;
  isSelected: boolean;
}) {
  const category = getReminderCategory(reminder.category);
  const Icon = category.icon;
  const message = buildReminderMessage(reminder);

  return (
    <ReminderMessageLink
      actionItemId={reminder.actionItem.id}
      className={`block border-l-4 px-4 py-4 transition hover:bg-secondary/60 ${
        isSelected
          ? "border-l-primary bg-secondary/80"
          : "border-l-transparent bg-card/70"
      }`}
      href={`/reminders?filter=${filter}&reminder=${reminder.actionItem.id}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <MessageCircleHeart className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className={category.badgeClassName}>
              <Icon className="mr-1 size-3" aria-hidden="true" />
              {category.title}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatShortDate(reminder.deadlineAt)}
            </span>
          </div>
          <p className="mt-2 truncate text-sm font-semibold text-foreground">
            {message.title}
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
            {message.preview}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant={reminder.isRead ? "outline" : "info"}>
              {reminder.isRead ? "Read" : "Unread"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {statusLabels[reminder.actionItem.status]}
            </span>
          </div>
        </div>
      </div>
    </ReminderMessageLink>
  );
}

function ReminderReadingPane({
  reminder,
  filter,
}: {
  reminder: ReminderRecord;
  filter: ReminderFilter;
}) {
  const { actionItem } = reminder;
  const category = getReminderCategory(reminder.category);
  const Icon = category.icon;
  const message = buildReminderMessage(reminder);

  return (
    <article className="flex min-h-[620px] flex-col bg-card">
      <header className="border-b border-border p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={category.badgeClassName}>
                <Icon className="mr-1 size-3" aria-hidden="true" />
                {category.title}
              </Badge>
              <Badge variant={reminder.isRead ? "outline" : "info"}>
                {reminder.isRead ? "Read" : "Unread"}
              </Badge>
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
              {message.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              From Smart Meeting Workspace Reminder
            </p>
          </div>
          <div className="text-sm text-muted-foreground sm:text-right">
            <p className="font-medium text-foreground">
              {reminder.deadlineLabel}
            </p>
            <p>{statusLabels[actionItem.status]}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-5 p-5">
        <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-secondary/80 via-card to-card p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Smart Meeting Workspace Reminder
          </p>
          <p className="mt-5 text-base leading-7 text-foreground">
            {message.greeting}
          </p>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            {message.body}
          </p>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            {message.encouragement}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
            Action item snapshot
          </p>

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Info label="Action" value={actionItem.title} />
            <Info label="Project" value={reminder.projectName} />
            <Info label="Deadline" value={reminder.deadlineLabel} />
            <Info label="Status" value={statusLabels[actionItem.status]} />
          </dl>
        </div>
      </div>

      <footer className="border-t border-border bg-muted/20 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form action={openReminderAction}>
            <input type="hidden" name="actionItemId" value={actionItem.id} />
            <Button type="submit">
              Open related action
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </form>
          <Button
            render={<a href={`/reminders?filter=${filter}`} />}
            variant="outline"
          >
            <X className="size-3.5" aria-hidden="true" />
            Close
          </Button>
        </div>
      </footer>
    </article>
  );
}

function getReminderCategory(
  category: ReminderCategory,
): (typeof reminderCategories)[number] {
  return (
    reminderCategories.find((reminderCategory) => {
      return reminderCategory.category === category;
    }) ?? reminderCategories[2]
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md bg-card/70 px-3 py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}

function buildReminderMessage(reminder: ReminderRecord) {
  const { actionItem } = reminder;
  const now = new Date();
  const deadlineAt = reminder.deadlineAt;
  const dayDifference = Math.ceil(
    (startOfDay(deadlineAt).getTime() - startOfDay(now).getTime()) /
      86_400_000,
  );

  if (reminder.category === "overdue") {
    const lateLabel =
      dayDifference < 0
        ? `${Math.abs(dayDifference)} day${Math.abs(dayDifference) === 1 ? "" : "s"} ago`
        : "earlier today";

    return {
      title: "This action item needs a quick rescue",
      preview: `"${actionItem.title}" passed its deadline ${lateLabel}.`,
      greeting: "Hi, this action item is asking for a little attention.",
      body: `"${actionItem.title}" passed its deadline ${lateLabel} (${reminder.deadlineLabel}). Take a quick look, send a follow-up, or update the status so this work does not stay stuck.`,
      encouragement:
        "You do not have to solve everything at once. One clear update today can unblock the next step and make the whole workspace feel lighter.",
    };
  }

  if (reminder.category === "due_today") {
    return {
      title: "Today is a great day to close the loop",
      preview: `"${actionItem.title}" is due today.`,
      greeting: "Hi, today is the perfect moment to give this action a push.",
      body: `"${actionItem.title}" is due today (${reminder.deadlineLabel}). You still have time to follow up, finish the next step, or update the status before the day ends.`,
      encouragement:
        "Small progress still counts. A short follow-up now can turn this from a pending task into a clean win.",
    };
  }

  const remainingDays = Math.max(dayDifference, 1);

  return {
    title: `${remainingDays} day${remainingDays === 1 ? "" : "s"} left — a calm reminder before the deadline`,
    preview: `You still have ${remainingDays} day${remainingDays === 1 ? "" : "s"} to follow up.`,
    greeting: "Hi, you still have time to handle this calmly.",
    body: `You have an unfinished action item: "${actionItem.title}". The deadline is ${reminder.deadlineLabel}, so you still have ${remainingDays} day${remainingDays === 1 ? "" : "s"} to follow up, ask for an update, or complete it.`,
    encouragement:
      "A tiny update today can save you from a deadline rush later. Future you will be grateful for the calm little move you make now.",
  };
}

function normalizeFilter(filter?: string): ReminderFilter {
  if (
    filter === "unread" ||
    filter === "overdue" ||
    filter === "due_today" ||
    filter === "due_soon"
  ) {
    return filter;
  }

  return "all";
}

function filterReminders(reminders: ReminderRecord[], filter: ReminderFilter) {
  if (filter === "all") {
    return reminders;
  }

  if (filter === "unread") {
    return reminders.filter((reminder) => {
      return !reminder.isRead;
    });
  }

  return reminders.filter((reminder) => {
    return reminder.category === filter;
  });
}

function groupRemindersByTime(reminders: ReminderRecord[]) {
  const groups = [
    { title: "This week", reminders: [] as ReminderRecord[] },
    { title: "Last week", reminders: [] as ReminderRecord[] },
    { title: "Last month", reminders: [] as ReminderRecord[] },
    { title: "Older reminders", reminders: [] as ReminderRecord[] },
  ];
  const now = new Date();
  const startOfThisWeekDate = startOfWeek(now);
  const startOfLastWeekDate = new Date(startOfThisWeekDate);
  startOfLastWeekDate.setDate(startOfLastWeekDate.getDate() - 7);
  const startOfThisMonthDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  reminders.forEach((reminder) => {
    if (reminder.deadlineAt >= startOfThisWeekDate) {
      groups[0].reminders.push(reminder);
      return;
    }

    if (reminder.deadlineAt >= startOfLastWeekDate) {
      groups[1].reminders.push(reminder);
      return;
    }

    if (
      reminder.deadlineAt >= startOfLastMonthDate &&
      reminder.deadlineAt < startOfThisMonthDate
    ) {
      groups[2].reminders.push(reminder);
      return;
    }

    groups[3].reminders.push(reminder);
  });

  return groups.filter((group) => {
    return group.reminders.length > 0;
  });
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function startOfWeek(date: Date) {
  const startDate = startOfDay(date);
  const day = startDate.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  startDate.setDate(startDate.getDate() + mondayOffset);
  return startDate;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
