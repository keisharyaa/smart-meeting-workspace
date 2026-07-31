import { createClient } from "@/lib/supabase/server";

import type {
  ActiveProjectOption,
  Meeting,
  MeetingSource,
  MeetingMetadataInput,
  PublishedMeetingListItem,
} from "./types";

export async function listActiveProjects(
  ownerId: string,
): Promise<ActiveProjectOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name")
    .eq("owner_id", ownerId)
    .eq("status", "active")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load active projects.");
  }

  return data;
}

export async function getActiveProject(
  ownerId: string,
  projectId: string,
): Promise<{ id: string; name: string } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", projectId)
    .eq("owner_id", ownerId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error("Unable to verify the selected project.");
  }

  return data;
}

export async function insertMeetingDraft(
  ownerId: string,
  input: MeetingMetadataInput,
): Promise<Meeting> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meetings")
    .insert({
      owner_id: ownerId,
      project_id: input.projectId,
      title: input.title.trim(),
      meeting_date: input.meetingDate,
      meeting_time: input.meetingTime || null,
      participants: input.participants,
      status: "draft",
      is_published: false,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error("Unable to create the meeting draft.");
  }

  return data;
}

export async function insertMeetingSources(
  sources: DatabaseMeetingSourceInsert[],
): Promise<MeetingSource[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meeting_sources")
    .insert(sources)
    .select("*");

  if (error) {
    throw new Error("Unable to save the meeting sources.");
  }

  return data;
}

export async function deleteMeetingDraft(
  ownerId: string,
  meetingId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("meetings")
    .delete()
    .eq("id", meetingId)
    .eq("owner_id", ownerId)
    .eq("is_published", false);

  if (error) {
    console.error("Unable to remove incomplete meeting draft:", error);
  }
}

export async function getOwnedMeetingDraft(
  ownerId: string,
  meetingId: string,
): Promise<Meeting | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("id", meetingId)
    .eq("owner_id", ownerId)
    .eq("is_published", false)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load the meeting draft.");
  }

  return data;
}

export async function listPublishedMeetings(
  ownerId: string,
): Promise<PublishedMeetingListItem[]> {
  const supabase = await createClient();

  const { data: meetings, error: meetingsError } = await supabase
    .from("meetings")
    .select("id, title, project_id, meeting_date, meeting_time, participants, status, approved_summary, published_at, updated_at, created_at, owner_id, is_published")
    .eq("owner_id", ownerId)
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .order("updated_at", { ascending: false });

  if (meetingsError) {
    throw new Error("Unable to load published meetings.");
  }

  if (!meetings || meetings.length === 0) {
    return [];
  }

  const projectIds = [...new Set(meetings.map((meeting) => meeting.project_id))];
  const meetingIds = meetings.map((meeting) => meeting.id);

  const [
    { data: projects, error: projectsError },
    { data: officialActionItems, error: officialActionItemsError },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name")
      .eq("owner_id", ownerId)
      .in("id", projectIds),
    supabase
      .from("action_items")
      .select("meeting_id")
      .eq("owner_id", ownerId)
      .eq("is_official", true)
      .in("meeting_id", meetingIds),
  ]);

  if (projectsError || officialActionItemsError) {
    throw new Error("Unable to load meeting records.");
  }

  const projectNameById = new Map(
    (projects ?? []).map((project) => [project.id, project.name]),
  );
  const actionItemCountByMeetingId = new Map<string, number>();

  for (const actionItem of officialActionItems ?? []) {
    if (!actionItem.meeting_id) {
      continue;
    }

    actionItemCountByMeetingId.set(
      actionItem.meeting_id,
      (actionItemCountByMeetingId.get(actionItem.meeting_id) ?? 0) + 1,
    );
  }

  return meetings.map((meeting) => ({
    meeting,
    projectName: projectNameById.get(meeting.project_id) ?? "Unknown project",
    officialActionItemCount: actionItemCountByMeetingId.get(meeting.id) ?? 0,
  }));
}

type DatabaseMeetingSourceInsert = {
  owner_id: string;
  meeting_id: string;
  source_type: "file" | "pasted_text";
  original_file_name?: string | null;
  mime_type?: string | null;
  file_size_bytes?: number | null;
  storage_path?: string | null;
  raw_text: string;
  source_order: number;
};
