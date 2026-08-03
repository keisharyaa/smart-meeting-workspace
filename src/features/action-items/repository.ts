import { createClient } from "@/lib/supabase/server";

import type {
  ActionItem,
  ActionItemFilters,
  ActionItemFormInput,
  ActionItemProject,
  ActionItemStatus,
  OfficialActionItemRecord,
} from "./types";

/**
 * Official action-item repository.
 *
 * TODO(Olyvia):
 * 1. Read only is_official = true for official pages.
 * 2. Scope every query by owner_id.
 * 3. Support project and status filters.
 * 4. Preserve source meeting linkage.
 * 5. Keep overdue as derived urgency, never as workflow status.
 */
export async function listOfficialActionItems(
  ownerId: string,
  filters: ActionItemFilters = {},
): Promise<OfficialActionItemRecord[]> {
  const supabase = await createClient();

  let query = supabase
    .from("action_items")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("is_official", true)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("updated_at", { ascending: false });

  if (filters.projectId) {
    query = query.eq("project_id", filters.projectId);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.priority === "none") {
    query = query.is("priority", null);
  } else if (filters.priority) {
    query = query.eq("priority", filters.priority);
  }

  if (filters.search?.trim()) {
    query = query.ilike("title", `%${filters.search.trim()}%`);
  }

  const { data: actionItems, error } = await query;

  if (error) {
    throw new Error("Unable to load official action items.");
  }

  if (!actionItems || actionItems.length === 0) {
    return [];
  }

  const projectIds = [...new Set(actionItems.map((item) => item.project_id))];
  const meetingIds = [
    ...new Set(
      actionItems
        .map((item) => item.meeting_id)
        .filter((meetingId): meetingId is string => Boolean(meetingId)),
    ),
  ];

  const [
    { data: projects, error: projectsError },
    { data: meetings, error: meetingsError },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name")
      .eq("owner_id", ownerId)
      .in("id", projectIds),
    meetingIds.length > 0
      ? supabase
          .from("meetings")
          .select("id, title")
          .eq("owner_id", ownerId)
          .in("id", meetingIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (projectsError || meetingsError) {
    throw new Error("Unable to load action item context.");
  }

  const projectNameById = new Map(
    (projects ?? []).map((project) => [project.id, project.name]),
  );
  const meetingTitleById = new Map(
    (meetings ?? []).map((meeting) => [meeting.id, meeting.title]),
  );

  return actionItems.map((actionItem) => ({
    actionItem,
    projectName: projectNameById.get(actionItem.project_id) ?? "Unknown project",
    meetingTitle: actionItem.meeting_id
      ? meetingTitleById.get(actionItem.meeting_id) ?? "Unknown meeting"
      : null,
  }));
}

export async function listActionItemProjects(
  ownerId: string,
): Promise<ActionItemProject[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, status")
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load projects for action items.");
  }

  return data;
}

export async function insertManualActionItem(
  ownerId: string,
  input: ActionItemFormInput,
): Promise<ActionItem> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("action_items")
    .insert({
      owner_id: ownerId,
      project_id: input.projectId,
      title: input.title,
      description: input.description || null,
      pic_name: input.picName || null,
      due_date: input.dueDate || null,
      due_time: input.dueDate ? input.dueTime || null : null,
      priority: input.priority || null,
      status: input.status ?? "todo",
      is_official: true,
      published_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    throw new Error("Unable to create the action item.");
  }

  return data;
}

export async function updateActionItemRecord(
  ownerId: string,
  actionItemId: string,
  input: Omit<ActionItemFormInput, "projectId">,
): Promise<ActionItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("action_items")
    .update({
      title: input.title,
      description: input.description || null,
      pic_name: input.picName || null,
      due_date: input.dueDate || null,
      due_time: input.dueDate ? input.dueTime || null : null,
      priority: input.priority || null,
      status: input.status,
      completed_at: input.status === "done" ? new Date().toISOString() : null,
    })
    .eq("id", actionItemId)
    .eq("owner_id", ownerId)
    .eq("is_official", true)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error("Unable to update the action item.");
  }

  return data;
}

export async function updateActionStatus(
  ownerId: string,
  actionItemId: string,
  status: ActionItemStatus,
): Promise<ActionItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("action_items")
    .update({
      status,
      completed_at: status === "done" ? new Date().toISOString() : null,
    })
    .eq("id", actionItemId)
    .eq("owner_id", ownerId)
    .eq("is_official", true)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error("Unable to update action item status.");
  }

  return data;
}

export async function deleteActionItemRecord(
  ownerId: string,
  actionItemId: string,
): Promise<ActionItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("action_items")
    .delete()
    .eq("id", actionItemId)
    .eq("owner_id", ownerId)
    .eq("is_official", true)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error("Unable to delete the action item.");
  }

  return data;
}

export async function syncMeetingStatusFromActions(
  ownerId: string,
  meetingId: string | null,
): Promise<void> {
  if (!meetingId) return;

  const supabase = await createClient();
  const { count, error: countError } = await supabase
    .from("action_items")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", ownerId)
    .eq("meeting_id", meetingId)
    .eq("is_official", true)
    .in("status", ["todo", "in_progress", "blocked"]);

  if (countError) {
    throw new Error("Unable to recalculate meeting status.");
  }

  const { error: updateError } = await supabase
    .from("meetings")
    .update({
      status: (count ?? 0) > 0 ? "processing" : "completed",
    })
    .eq("id", meetingId)
    .eq("owner_id", ownerId)
    .eq("is_published", true);

  if (updateError) {
    throw new Error("Unable to update the linked meeting status.");
  }
}
