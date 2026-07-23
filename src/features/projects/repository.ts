import type {
  Project,
  ProjectFormInput,
  ProjectListFilters,
  ProjectStatus,
} from "./types";

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

export async function updateProjectRecord(
  ownerId: string,
  projectId: string,
  input: ProjectFormInput,
): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .update({
      name: input.name,
      description: input.description || null,
    })
    .eq("id", projectId)
    .eq("owner_id", ownerId)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error("Unable to update project.");
  }

  return data;
}

export async function updateProjectLifecycleRecord(
  ownerId: string,
  projectId: string,
  currentStatuses: ProjectStatus[],
  update: Pick<Project, "status" | "completed_at" | "archived_at">,
): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .update(update)
    .eq("id", projectId)
    .eq("owner_id", ownerId)
    .in("status", currentStatuses)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error("Unable to update project status.");
  }

  return data;
}

export async function countUnfinishedOfficialActions(ownerId: string, projectId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("action_items")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", ownerId)
    .eq("project_id", projectId)
    .eq("is_official", true)
    .in("status", ["todo", "in_progress", "blocked"]);

  if (error) {
    throw new Error("Unable to check unfinished action items.");
  }

  return count ?? 0;
}
