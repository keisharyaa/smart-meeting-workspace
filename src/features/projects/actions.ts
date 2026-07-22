"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { createProject } from "./service";

export interface CreateProjectActionState {
  message: string | null;
  fieldErrors: {
    name?: string;
  };
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
