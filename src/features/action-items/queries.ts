import { createClient } from "@/lib/supabase/server";

import { listActionItemProjects, listOfficialActionItems } from "./repository";
import type {
  ActionItemFilters,
  ActionItemProject,
  OfficialActionItemRecord,
} from "./types";

export interface ActionItemsPageData {
  actionItems: OfficialActionItemRecord[];
  projects: ActionItemProject[];
  error: string | null;
}

export async function getCurrentUserActionItemsPageData(
  filters: ActionItemFilters,
): Promise<ActionItemsPageData> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        actionItems: [],
        projects: [],
        error: "Please sign in to view action items.",
      };
    }

    const [actionItems, projects] = await Promise.all([
      listOfficialActionItems(user.id, filters),
      listActionItemProjects(user.id),
    ]);

    return {
      actionItems,
      projects,
      error: null,
    };
  } catch (error) {
    console.error("Unable to load action items page:", error);

    return {
      actionItems: [],
      projects: [],
      error: "We could not load your action items. Please try again.",
    };
  }
}
