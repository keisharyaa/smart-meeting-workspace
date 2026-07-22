export interface DashboardSummary {
  activeProjects: number;
  doneProjects: number;
  processingMeetings: number;
  completedMeetings: number;
  openActions: number;
  dueThisWeekActions: number;
  overdueActions: number;
  completedActions: number;
  unreadReminders: number;
  nearestDeadline: string | null;
}

/**
 * TODO(Olyvia):
 * 1. Aggregate official data only.
 * 2. Exclude drafts and failed publications.
 * 3. Exclude archived projects from Active/Done counts.
 * 4. Return safe zero-value empty state.
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  return {
    activeProjects: 0, doneProjects: 0, processingMeetings: 0,
    completedMeetings: 0, openActions: 0, dueThisWeekActions: 0,
    overdueActions: 0, completedActions: 0, unreadReminders: 0,
    nearestDeadline: null,
  };
}
