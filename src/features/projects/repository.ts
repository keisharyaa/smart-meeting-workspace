import type { Project, ProjectFormInput, ProjectListFilters, ProjectUpdate } from "./types";

/**
 * Project repository.
 *
 * TODO(Olyvia):
 * 1. Use the authenticated Supabase server client.
 * 2. Scope every query by owner_id.
 * 3. Return typed project records.
 * 4. Map database failures to AppError.
 * 5. Do not implement lifecycle business rules here.
 */
export async function listProjects(ownerId: string, filters: ProjectListFilters = {}): Promise<Project[]> {
  void ownerId; void filters;
  return [];
}

export async function getProjectById(ownerId: string, projectId: string): Promise<Project | null> {
  void ownerId; void projectId;
  return null;
}

export async function insertProject(ownerId: string, input: ProjectFormInput): Promise<Project> {
  void ownerId; void input;
  throw new Error("TODO: implement insertProject");
}

export async function updateProjectRecord(ownerId: string, projectId: string, input: ProjectUpdate): Promise<Project> {
  void ownerId; void projectId; void input;
  throw new Error("TODO: implement updateProjectRecord");
}

export async function countUnfinishedOfficialActions(ownerId: string, projectId: string): Promise<number> {
  void ownerId; void projectId;
  return 0;
}
