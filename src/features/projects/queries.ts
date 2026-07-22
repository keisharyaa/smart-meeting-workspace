import { createClient } from "@/lib/supabase/server";

import { listProjects } from "./repository";
import type { Project } from "./types";

export type ProjectListQueryResult =
  | { projects: Project[]; error: null }
  | { projects: Project[]; error: string };

/**
 * Retrieves only the current workspace owner's projects.
 *
 * Authentication and route protection remain owned by the workspace module.
 * This query returns a safe state while that shared protection is still being
 * integrated, rather than exposing another user's data.
 */
export async function getCurrentUserProjects(): Promise<ProjectListQueryResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        projects: [],
        error: "Please sign in to view your projects.",
      };
    }

    const projects = await listProjects(user.id);

    return { projects, error: null };
  } catch (error) {
    console.error("Unable to load projects:", error);

    return {
      projects: [],
      error: "We could not load your projects. Please try again.",
    };
  }
}
