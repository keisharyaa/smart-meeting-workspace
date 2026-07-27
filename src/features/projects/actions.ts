"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import {
  archiveProject,
  createProject,
  markProjectDone,
  reopenProject,
  restoreProject,
  updateProject,
} from "./service";

export interface ProjectFormActionState {
  message: string | null;
  fieldErrors: {
    name?: string;
  };
}

export type CreateProjectActionState = ProjectFormActionState;
export type UpdateProjectActionState = ProjectFormActionState;

export interface ProjectLifecycleActionState {
  success: boolean;
  message: string | null;
}

export async function createProjectAction(
  _previousState: CreateProjectActionState,
  formData: FormData,
): Promise<CreateProjectActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) {
    return {
      message: "Please correct the highlighted field.",
      fieldErrors: { name: "Project name is required." },
    };
  }

  let projectId: string;

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        message: "Please sign in before creating a project.",
        fieldErrors: {},
      };
    }

    const project = await createProject(user.id, { name, description });
    projectId = project.id;
  } catch (error) {
    console.error("Unable to create project:", error);

    return {
      message: "We could not create the project. Please try again.",
      fieldErrors: {},
    };
  }

  revalidatePath("/projects");
  redirect(`/projects/${projectId}`);
}

export async function updateProjectAction(
  _previousState: UpdateProjectActionState,
  formData: FormData,
): Promise<UpdateProjectActionState> {
  const projectId = String(formData.get("projectId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  let projectWasNotFound = false;

  if (!name) {
    return {
      message: "Please correct the highlighted field.",
      fieldErrors: { name: "Project name is required." },
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        message: "Please sign in before editing a project.",
        fieldErrors: {},
      };
    }

    const project = await updateProject(user.id, projectId, {
      name,
      description,
    });

    projectWasNotFound = !project;
  } catch (error) {
    console.error("Unable to update project:", error);

    return {
      message: "We could not update the project. Please try again.",
      fieldErrors: {},
    };
  }

  if (projectWasNotFound) {
    redirect(`/projects/${projectId}`);
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}

export async function markProjectDoneAction(
  projectId: string,
): Promise<ProjectLifecycleActionState> {
  return runLifecycleAction(projectId, markProjectDone);
}

export async function reopenProjectAction(
  projectId: string,
): Promise<ProjectLifecycleActionState> {
  return runLifecycleAction(projectId, reopenProject);
}

export async function archiveProjectAction(
  projectId: string,
): Promise<ProjectLifecycleActionState> {
  return runLifecycleAction(projectId, archiveProject);
}

export async function restoreProjectAction(
  projectId: string,
): Promise<ProjectLifecycleActionState> {
  return runLifecycleAction(projectId, restoreProject);
}

async function runLifecycleAction(
  projectId: string,
  changeProject: (ownerId: string, projectId: string) => Promise<unknown>,
): Promise<ProjectLifecycleActionState> {
  if (!isUuid(projectId)) {
    return { success: false, message: "This project is not available." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: "Please sign in before changing project status." };
    }

    await changeProject(user.id, projectId);
  } catch (error) {
    console.error("Unable to update project lifecycle:", error);

    const message = error instanceof Error ? error.message : "Please try again.";
    return { success: false, message };
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  return { success: true, message: null };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
