import type { Database } from "@/types/database";

export type ActionItem = Database["public"]["Tables"]["action_items"]["Row"];
export type ActionItemStatus = ActionItem["status"];
export type ActionItemPriority = ActionItem["priority"];

export interface ActionItemFilters {
  projectId?: string;
  status?: ActionItemStatus;
  search?: string;
}
