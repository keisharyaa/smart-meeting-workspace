"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { createProject, updateProject } from "./service";

export interface ProjectFormActionState {
  message: string | null;
  fieldErrors: {
    name?: string;
  };
}

export type CreateProjectActionState = ProjectFormActionState;
export type UpdateProjectActionState = ProjectFormActionState;

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
