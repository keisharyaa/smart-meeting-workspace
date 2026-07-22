import { insertProject } from "./repository";
import type { Project, ProjectFormInput } from "./types";

/**
 * Project business rules.
 *
 * TODO(Olyvia):
 * 1. Normalize and validate input.
 * 2. New projects start as active.
 * 3. Mark Done only when no official unfinished action remains.
 * 4. Reopen changes done to active.
 * 5. Archive changes active/done to archived.
 * 6. Restore changes archived to active.
 * 7. Ignore draft actions in completion checks.
 */
export async function createProject(ownerId: string, input: ProjectFormInput): Promise<Project> {
  const name = input.name.trim();
  const description = input.description?.trim() || undefined;

  if (!name) {
    throw new Error("Project name is required.");
  }

  return insertProject(ownerId, { name, description });
}

export async function markProjectDone(ownerId: string, projectId: string): Promise<Project> {
  void ownerId; void projectId;
  throw new Error("TODO: implement markProjectDone");
}
