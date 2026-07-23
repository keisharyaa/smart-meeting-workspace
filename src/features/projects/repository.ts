import type { Project, ProjectFormInput, ProjectListFilters, ProjectUpdate } from "./types";

import { createClient } from "@/lib/supabase/server";

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
  const supabase = await createClient();

  let query = supabase
    .from("projects")
    .select("*")
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.search?.trim()) {
    query = query.ilike("name", `%${filters.search.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Unable to load projects.");
  }

  return data;
}

export async function getProjectById(ownerId: string, projectId: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load project.");
  }

  return data;
}

export async function insertProject(ownerId: string, input: ProjectFormInput): Promise<Project> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      owner_id: ownerId,
      name: input.name,
      description: input.description || null,
      status: "active",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error("Unable to create project.");
  }

  return data;
}

export async function updateProjectRecord(ownerId: string, projectId: string, input: ProjectUpdate): Promise<Project> {
  void ownerId; void projectId; void input;
  throw new Error("TODO: implement updateProjectRecord");
}

export async function countUnfinishedOfficialActions(ownerId: string, projectId: string): Promise<number> {
  void ownerId; void projectId;
  return 0;
}
