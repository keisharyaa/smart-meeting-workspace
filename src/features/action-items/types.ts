import type { Database } from "@/types/database";

export type ActionItem = Database["public"]["Tables"]["action_items"]["Row"];
export type ActionItemStatus = ActionItem["status"];
export type ActionItemPriority = ActionItem["priority"];
export type ActionItemPriorityFilter = NonNullable<ActionItemPriority> | "none";
export type ActionItemProject = Pick<
  Database["public"]["Tables"]["projects"]["Row"],
  "id" | "name" | "status"
>;
export type ActionItemMeeting = Pick<
  Database["public"]["Tables"]["meetings"]["Row"],
  "id" | "title" | "meeting_date"
>;

export interface ActionItemFilters {
  projectId?: string;
  status?: ActionItemStatus;
  priority?: ActionItemPriorityFilter;
  search?: string;
}

export interface OfficialActionItemRecord {
  actionItem: ActionItem;
  projectName: string;
  meetingTitle: string | null;
}

export interface ActionItemFormInput {
  projectId: string;
  title: string;
  description?: string | null;
  picName?: string | null;
  dueDate?: string | null;
  dueTime?: string | null;
  priority?: ActionItemPriority;
  status?: ActionItemStatus;
}
