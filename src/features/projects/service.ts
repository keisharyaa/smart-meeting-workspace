import {
  countUnfinishedOfficialActions,
  insertProject,
  updateProjectLifecycleRecord,
  updateProjectRecord,
} from "./repository";
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

export async function updateProject(
  ownerId: string,
  projectId: string,
  input: ProjectFormInput,
): Promise<Project | null> {
  const name = input.name.trim();
  const description = input.description?.trim() || undefined;

  if (!name) {
    throw new Error("Project name is required.");
  }

  return updateProjectRecord(ownerId, projectId, { name, description });
}

export async function markProjectDone(ownerId: string, projectId: string): Promise<Project> {
  const unfinishedActionCount = await countUnfinishedOfficialActions(ownerId, projectId);

  if (unfinishedActionCount > 0) {
    throw new Error(
      "This project still has unfinished official action items and cannot be marked as done.",
    );
  }

  return requireLifecycleProject(
    updateProjectLifecycleRecord(ownerId, projectId, ["active"], {
      status: "done",
      completed_at: new Date().toISOString(),
      archived_at: null,
    }),
    "This project is not available to mark as done.",
  );
}

export async function reopenProject(ownerId: string, projectId: string): Promise<Project> {
  return requireLifecycleProject(
    updateProjectLifecycleRecord(ownerId, projectId, ["done"], {
      status: "active",
      completed_at: null,
      archived_at: null,
    }),
    "Only a done project can be reopened.",
  );
}

export async function archiveProject(ownerId: string, projectId: string): Promise<Project> {
  return requireLifecycleProject(
    updateProjectLifecycleRecord(ownerId, projectId, ["active", "done"], {
      status: "archived",
      completed_at: null,
      archived_at: new Date().toISOString(),
    }),
    "Only an active or done project can be archived.",
  );
}

export async function restoreProject(ownerId: string, projectId: string): Promise<Project> {
  return requireLifecycleProject(
    updateProjectLifecycleRecord(ownerId, projectId, ["archived"], {
      status: "active",
      completed_at: null,
      archived_at: null,
    }),
    "Only an archived project can be restored.",
  );
}

async function requireLifecycleProject(
  projectPromise: Promise<Project | null>,
  message: string,
): Promise<Project> {
  const project = await projectPromise;

  if (!project) {
    throw new Error(message);
  }

  return project;
}
