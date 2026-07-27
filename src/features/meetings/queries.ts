import { createClient } from "@/lib/supabase/server";

import { listActiveProjects } from "./repository";
import type { ActiveProjectOption } from "./types";

export interface ActiveProjectsQueryResult {
  projects: ActiveProjectOption[];
  error: string | null;
}

export async function getCurrentUserActiveProjects(): Promise<ActiveProjectsQueryResult> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        projects: [],
        error: "Please sign in before creating a meeting.",
      };
    }

    const projects = await listActiveProjects(user.id);

    return {
      projects,
      error: null,
    };
  } catch (error) {
    console.error("Unable to load active projects:", error);

    return {
      projects: [],
      error: "We could not load active projects. Please try again.",
    };
  }
}