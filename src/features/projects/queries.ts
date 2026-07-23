import { createClient } from "@/lib/supabase/server";

import { getProjectById, listProjects } from "./repository";
import type { Project } from "./types";

export type ProjectListQueryResult =
  | { projects: Project[]; error: null }
  | { projects: Project[]; error: string };

export type ProjectDetailQueryResult =
  | { project: Project; error: null }
  | { project: null; error: null }
  | { project: null; error: string };

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

/**
 * Retrieves one project for the current workspace owner only. A project that
 * belongs to another owner is intentionally indistinguishable from a missing
 * project at the page boundary.
 */
export async function getCurrentUserProject(
  projectId: string,
): Promise<ProjectDetailQueryResult> {
  if (!uuidPattern.test(projectId)) {
    return { project: null, error: null };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        project: null,
        error: "Please sign in to view this project.",
      };
    }

    const project = await getProjectById(user.id, projectId);
    return { project, error: null };
  } catch (error) {
    console.error("Unable to load project:", error);

    return {
      project: null,
      error: "We could not load this project. Please try again.",
    };
  }
}
