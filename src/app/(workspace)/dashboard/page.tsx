import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FolderKanban,
  Inbox,
  Sparkles,
  UsersRound,
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
import { cn } from "@/lib/utils";

import {
  getDashboardData,
  type DashboardData,
  type DashboardDeadlineDistribution,
  type DashboardSummary,
  type DashboardUrgentAction,
} from "@/features/dashboard/queries";

export default async function DashboardPage() {
  const { dashboard, hasError } = await loadDashboard();

  if (hasError || !dashboard) {
    return (
      <PageContainer>
        <PageHeader
          eyebrow="Workspace"
          title="Dashboard"
          description="Your workspace summary could not be loaded right now."
        />
        <ErrorState
          title="Dashboard is unavailable"
          message="We could not load your workspace summary. Please check your connection and try again."
          action={
            <Button variant="outline" render={<Link href="/dashboard" />}>
              Retry
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return <DashboardContent dashboard={dashboard} />;
}

async function loadDashboard() {
  try {
    const dashboard = await getDashboardData();

    return { dashboard, hasError: false };
  } catch {
    return { dashboard: null, hasError: true };
  }
}

function DashboardContent({ dashboard }: { dashboard: DashboardData }) {
  const hasWorkspaceData =
    dashboard.summary.activeProjects +
      dashboard.summary.doneProjects +
      dashboard.summary.publishedMeetings +
      dashboard.summary.openActions +
      dashboard.summary.completedActions >
    0;

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Dashboard"
        description="A clear command center for projects, meetings, official action items, and work that needs attention."
        actions={
          <>
            <Button variant="outline" render={<Link href="/meetings" />}>
              View meetings
            </Button>
            <Button render={<Link href="/action-items" />}>
              Open action board
            </Button>
          </>
        }
      />

      <HeroPanel dashboard={dashboard} />

      {!hasWorkspaceData ? (
        <EmptyState
          title="Your workspace is ready"
          description="Create or publish meeting records first. Once official action items exist, this Dashboard will show project totals, urgent work, recent meetings, and PIC workload."
          action={
            <Button render={<Link href="/meetings/new" />}>
              Add meeting notes
            </Button>
          }
          icon={<Sparkles className="size-5" aria-hidden="true" />}
        />
      ) : (
        <>
          <SummaryGrid summary={dashboard.summary} />

          <ActionStatusDeadlineChart dashboard={dashboard} />

          <UrgentWorkCard urgentActions={dashboard.urgentActions} />

          <div className="grid gap-6 xl:grid-cols-3">
            <RecentMeetingsCard dashboard={dashboard} />
            <ProjectActivityCard dashboard={dashboard} />
            <PeopleWorkloadCard dashboard={dashboard} />
          </div>
        </>
      )}
    </PageContainer>
  );
}

function HeroPanel({ dashboard }: { dashboard: DashboardData }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-primary/15 bg-[linear-gradient(135deg,rgba(0,128,111,0.12),rgba(250,250,250,0.96)_48%,rgba(14,165,233,0.12))] shadow-[var(--shadow-card)]">
      <div className="p-6 lg:p-7">
        <div>
          <Badge variant="info" className="mb-4">
            Smart Meeting Workspace
          </Badge>
          <h2 className="max-w-3xl text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">
            Hi {firstName(dashboard.ownerName)}, here is what needs your
            attention today.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Track published meeting outcomes, official action items, urgent
            deadlines, and PIC workload in one calm workspace.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge variant="success">
              {dashboard.summary.openActions} open actions
            </Badge>
            <Badge variant="warning">
              {dashboard.summary.dueThisWeekActions} due this week
            </Badge>
            <Badge variant="destructive">
              {dashboard.summary.overdueActions} overdue
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
}

function ActionStatusDeadlineChart({
  dashboard,
}: {
  dashboard: DashboardData;
}) {
  const maxTotal = Math.max(
    ...dashboard.deadlineDistribution.map((item) => item.total),
    1,
  );

  return (
    <Card className="border-primary/20 bg-card/90 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="size-4 text-primary" aria-hidden="true" />
          Action status by deadline condition
        </CardTitle>
        <CardDescription>
          Hover each bar to see deadline color-code details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-64 items-end gap-3 rounded-2xl border border-border bg-[linear-gradient(180deg,rgba(240,253,250,0.78),rgba(255,255,255,0.96))] p-4">
          {dashboard.deadlineDistribution.map((item) => (
            <StackedDeadlineBar
              key={item.status}
              item={item}
              maxTotal={maxTotal}
            />
          ))}
        </div>

        <DeadlineLegend />
      </CardContent>
    </Card>
  );
}

function StackedDeadlineBar({
  item,
  maxTotal,
}: {
  item: DashboardDeadlineDistribution;
  maxTotal: number;
}) {
  const height = Math.max((item.total / maxTotal) * 100, item.total > 0 ? 16 : 3);
  const segments = getDeadlineSegments(item);

  return (
    <div className="group relative flex h-full flex-1 flex-col justify-end">
      <div className="mb-2 text-center">
        <span className="inline-flex min-w-7 justify-center rounded-full bg-card px-2 py-1 text-xs font-semibold text-foreground shadow-sm">
          {item.total}
        </span>
      </div>

      <div
        className="mx-auto flex w-full max-w-20 flex-col-reverse overflow-hidden rounded-t-2xl bg-secondary shadow-sm ring-1 ring-border transition group-hover:scale-[1.03]"
        style={{ height: `${height}%` }}
        aria-label={`${item.label}: ${item.total} action items`}
      >
        {segments.map((segment) =>
          segment.value > 0 && item.total > 0 ? (
            <span
              key={segment.key}
              className={segment.className}
              style={{ height: `${(segment.value / item.total) * 100}%` }}
            />
          ) : null,
        )}
      </div>

      <p className="mt-2 text-center text-xs font-semibold text-foreground">
        {item.label}
      </p>

      <div className="pointer-events-none absolute left-1/2 top-4 z-20 hidden w-64 -translate-x-1/2 rounded-xl border border-border bg-card p-4 text-left shadow-lg group-hover:block">
        <p className="font-semibold text-foreground">{item.label}</p>
        <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
          <TooltipRow color="bg-[#7c2d12]" label="Overdue" value={item.overdue} />
          <TooltipRow
            color="bg-red-500"
            label="Due today or within 2 days"
            value={item.dueSoon}
          />
          <TooltipRow
            color="bg-yellow-400"
            label="Due within 3 to 5 days"
            value={item.dueInThreeToFiveDays}
          />
          <TooltipRow
            color="bg-emerald-500"
            label={item.status === "done" ? "Done" : "More than 5 days away"}
            value={item.status === "done" ? item.done : item.dueLater}
          />
          <TooltipRow
            color="bg-sky-500"
            label="Not mentioned or unclear"
            value={item.notMentioned}
          />
        </ul>
      </div>
    </div>
  );
}

function TooltipRow({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-2">
        <span className={cn("size-2.5 shrink-0 rounded-full", color)} />
        <span>{label}</span>
      </span>
      <span className="font-semibold text-foreground">{value}</span>
    </li>
  );
}

function DeadlineLegend() {
  const items = [
    ["bg-[#7c2d12]", "Overdue"],
    ["bg-red-500", "Today / within 2 days"],
    ["bg-yellow-400", "Within 3–5 days"],
    ["bg-emerald-500", "More than 5 days / Done"],
    ["bg-sky-500", "Not mentioned"],
  ];

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {items.map(([color, label]) => (
        <span
          key={label}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground"
        >
          <span className={cn("size-2.5 rounded-full", color)} />
          {label}
        </span>
      ))}
    </div>
  );
}

function getDeadlineSegments(item: DashboardDeadlineDistribution) {
  if (item.status === "done") {
    return [
      {
        key: "done",
        value: item.total,
        className: "bg-emerald-500",
      },
    ];
  }

  return [
    {
      key: "overdue",
      value: item.overdue,
      className: "bg-[#7c2d12]",
    },
    {
      key: "red",
      value: item.dueSoon,
      className: "bg-red-500",
    },
    {
      key: "yellow",
      value: item.dueInThreeToFiveDays,
      className: "bg-yellow-400",
    },
    {
      key: "green",
      value: item.dueLater,
      className: "bg-emerald-500",
    },
    {
      key: "blue",
      value: item.notMentioned,
      className: "bg-sky-500",
    },
  ];
}

function SummaryGrid({ summary }: { summary: DashboardSummary }) {
  const items = [
    {
      label: "Active projects",
      value: summary.activeProjects,
      helper: `${summary.doneProjects} done`,
      icon: FolderKanban,
      tone: "text-primary bg-primary/10",
    },
    {
      label: "Published meetings",
      value: summary.publishedMeetings,
      helper: `${summary.completedMeetings} completed • ${summary.processingMeetings} processing`,
      icon: Inbox,
      tone: "text-sky-700 bg-sky-100",
    },
    {
      label: "Open actions",
      value: summary.openActions,
      helper: `${summary.completedActions} completed`,
      icon: ClipboardList,
      tone: "text-emerald-700 bg-emerald-100",
    },
    {
      label: "Unread reminders",
      value: summary.unreadReminders,
      helper: "",
      icon: Bell,
      tone: "text-amber-700 bg-amber-100",
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="overflow-hidden">
          <CardContent className="flex items-center gap-4 p-5">
            <span
              className={cn(
                "flex size-12 items-center justify-center rounded-xl",
                item.tone,
              )}
            >
              <item.icon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-3xl font-semibold text-foreground">
                {item.value}
              </p>
              {item.helper ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.helper}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function UrgentWorkCard({
  urgentActions,
}: {
  urgentActions: DashboardUrgentAction[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-destructive" aria-hidden="true" />
          Urgent work
        </CardTitle>
        <CardDescription>
          Shows up to 5 of the most urgent unfinished official action items:
          overdue, due today, or due soon. Open Reminders or Action Items to see
          the full list.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {urgentActions.length > 0 ? (
          <div className="space-y-3">
            {urgentActions.map((action) => (
              <Link
                key={action.id}
                href={`/action-items?open=${action.id}`}
                className="group block rounded-xl border border-border bg-background p-4 transition hover:border-primary/40 hover:bg-secondary/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={reminderBadgeVariant(action.category)}>
                        {reminderLabel(action.category)}
                      </Badge>
                      <Badge variant={action.isRead ? "outline" : "info"}>
                        {action.isRead ? "Read" : "Unread"}
                      </Badge>
                    </div>
                    <h3 className="mt-3 font-semibold text-foreground">
                      {action.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {action.projectName} • {statusLabel(action.status)}
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {action.deadlineLabel}
                    </p>
                  </div>
                  <ArrowRight
                    className="mt-1 size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            compact
            title="No urgent reminders"
            description="Nice. There are no official unfinished action items due soon, due today, or overdue."
            icon={<CheckCircle2 className="size-5" aria-hidden="true" />}
          />
        )}
      </CardContent>
    </Card>
  );
}

function RecentMeetingsCard({ dashboard }: { dashboard: DashboardData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock3 className="size-4 text-primary" aria-hidden="true" />
          Recent meetings
        </CardTitle>
        <CardDescription>
          Shows up to 5 of the latest published meeting records. Open Meetings
          to review every meeting in the workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {dashboard.recentMeetings.length > 0 ? (
          dashboard.recentMeetings.map((meeting) => (
            <Link
              key={meeting.id}
              href={`/meetings/${meeting.id}`}
              className="block rounded-xl border border-border bg-background p-4 transition hover:border-primary/40 hover:bg-secondary/50"
            >
              <h3 className="font-semibold text-foreground">{meeting.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {meeting.projectName}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline">{formatDate(meeting.meetingDate)}</Badge>
                <Badge variant="info">
                  {meeting.officialActionItemCount} action items
                </Badge>
              </div>
            </Link>
          ))
        ) : (
          <EmptyState
            compact
            title="No published meetings"
            description="Published meeting records will appear here."
          />
        )}
      </CardContent>
    </Card>
  );
}

function ProjectActivityCard({ dashboard }: { dashboard: DashboardData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="size-4 text-primary" aria-hidden="true" />
          Project activity
        </CardTitle>
        <CardDescription>
          Shows up to 5 active project updates, excluding archived projects. Open
          Projects to manage the full project list.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {dashboard.projectActivity.length > 0 ? (
          dashboard.projectActivity.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block rounded-xl border border-border bg-background p-4 transition hover:border-primary/40 hover:bg-secondary/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {project.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Updated {formatDate(project.updatedAt)}
                  </p>
                </div>
                <Badge variant={project.status === "done" ? "success" : "info"}>
                  {project.status === "done" ? "Done" : "Active"}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {project.openActionItemCount} open •{" "}
                {project.completedActionItemCount} completed actions
              </p>
            </Link>
          ))
        ) : (
          <EmptyState
            compact
            title="No project activity"
            description="Projects with official work will appear here."
          />
        )}
      </CardContent>
    </Card>
  );
}

function PeopleWorkloadCard({ dashboard }: { dashboard: DashboardData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UsersRound className="size-4 text-primary" aria-hidden="true" />
          PIC workload
        </CardTitle>
        <CardDescription>
          Shows up to 5 PICs with the highest open workload from published
          official action items. Open People to see every PIC and responsibility.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {dashboard.peopleWorkload.length > 0 ? (
          dashboard.peopleWorkload.map((person) => (
            <Link
              key={person.key}
              href={`/people/${person.key}`}
              className="block rounded-xl border border-border bg-background p-4 transition hover:border-primary/40 hover:bg-secondary/50"
            >
              <h3 className="font-semibold text-foreground">{person.fullName}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {person.role || "Role not mentioned"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="warning">
                  {person.openActionItemCount} open
                </Badge>
                <Badge variant="success">
                  {person.completedActionItemCount} completed
                </Badge>
              </div>
            </Link>
          ))
        ) : (
          <EmptyState
            compact
            title="No PIC workload yet"
            description="PICs from published official action items will appear here."
          />
        )}
      </CardContent>
    </Card>
  );
}

function reminderLabel(category: DashboardUrgentAction["category"]) {
  if (category === "overdue") return "Overdue";
  if (category === "due_today") return "Due today";
  return "Due soon";
}

function reminderBadgeVariant(category: DashboardUrgentAction["category"]) {
  if (category === "overdue") return "destructive";
  if (category === "due_today") return "warning";
  return "info";
}

function statusLabel(status: DashboardUrgentAction["status"]) {
  const labels = {
    todo: "To Do",
    in_progress: "In Progress",
    blocked: "Blocked",
    done: "Done",
  };

  return labels[status];
}

function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || "there";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
