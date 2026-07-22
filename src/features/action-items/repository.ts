import type { ActionItem, ActionItemFilters, ActionItemStatus } from "./types";

/**
 * Official action-item repository.
 *
 * TODO(Olyvia):
 * 1. Read only is_official = true for official pages.
 * 2. Scope every query by owner_id.
 * 3. Support project and status filters.
 * 4. Preserve source meeting linkage.
 * 5. Keep overdue as derived urgency, never as workflow status.
 */
export async function listOfficialActionItems(ownerId: string, filters: ActionItemFilters = {}): Promise<ActionItem[]> {
  void ownerId; void filters;
  return [];
}

export async function updateActionStatus(ownerId: string, actionItemId: string, status: ActionItemStatus): Promise<ActionItem> {
  void ownerId; void actionItemId; void status;
  throw new Error("TODO: implement updateActionStatus");
}
