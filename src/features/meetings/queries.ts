import { createClient } from "@/lib/supabase/server";

import { listActiveProjects, listPublishedMeetings } from "./repository";
import type {
  ActiveProjectOption,
  PublishedMeetingListItem,
  PublishedMeetingDetail,
} from "./types";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface ActiveProjectsQueryResult {
  projects: ActiveProjectOption[];
  error: string | null;
}

export interface PublishedMeetingsQueryResult {
  meetings: PublishedMeetingListItem[];
  error: string | null;
}

export async function getCurrentUserActiveProjects(): Promise<ActiveProjectsQueryResult> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        projects: [],
        error: "Please sign in before creating a meeting.",
      };
    }

    const projects = await listActiveProjects(user.id);

    return {
      projects,
      error: null,
    };
  } catch (error) {
    console.error("Unable to load active projects:", error);

    return {
      projects: [],
      error: "We could not load active projects. Please try again.",
    };
  }
}

export async function getCurrentUserPublishedMeetings(): Promise<PublishedMeetingsQueryResult> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        meetings: [],
        error: "Please sign in to view your meetings.",
      };
    }

    const meetings = await listPublishedMeetings(user.id);

    return {
      meetings,
      error: null,
    };
  } catch (error) {
    console.error("Unable to load published meetings:", error);

    return {
      meetings: [],
      error: "We could not load your meetings. Please try again.",
    };
  }
}

export async function getCurrentUserPublishedMeeting(
  meetingId: string,
): Promise<{
  meetingDetail: PublishedMeetingDetail | null;
  error: string | null;
}> {
  if (!uuidPattern.test(meetingId)) {
    return { meetingDetail: null, error: null };
  }

  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        meetingDetail: null,
        error: "Please sign in to view this meeting.",
      };
    }

    const { data: meeting, error: meetingError } = await supabase
      .from("meetings")
      .select("*")
      .eq("id", meetingId)
      .eq("owner_id", user.id)
      .eq("is_published", true)
      .maybeSingle();

    if (meetingError) throw meetingError;
    if (!meeting) return { meetingDetail: null, error: null };

    const [
      { data: project, error: projectError },
      { data: sources, error: sourcesError },
      { data: outcomes, error: outcomesError },
      { data: actionItems, error: actionItemsError },
    ] = await Promise.all([
      supabase
        .from("projects")
        .select("name")
        .eq("id", meeting.project_id)
        .eq("owner_id", user.id)
        .single(),
      supabase
        .from("meeting_sources")
        .select("*")
        .eq("meeting_id", meetingId)
        .eq("owner_id", user.id)
        .order("source_order", { ascending: true }),
      supabase
        .from("meeting_outcomes")
        .select("*")
        .eq("meeting_id", meetingId)
        .eq("owner_id", user.id)
        .order("outcome_type", { ascending: true })
        .order("display_order", { ascending: true }),
      supabase
        .from("action_items")
        .select("*")
        .eq("meeting_id", meetingId)
        .eq("owner_id", user.id)
        .eq("is_official", true)
        .order("created_at", { ascending: true }),
    ]);

    if (projectError || sourcesError || outcomesError || actionItemsError) {
      throw projectError ?? sourcesError ?? outcomesError ?? actionItemsError;
    }

    return {
      meetingDetail: {
        meeting,
        projectName: project.name,
        sources: sources ?? [],
        outcomes: outcomes ?? [],
        actionItems: actionItems ?? [],
      },
      error: null,
    };
  } catch (error) {
    console.error("Unable to load published meeting detail:", error);

    return {
      meetingDetail: null,
      error: "We could not load this meeting detail. Please try again.",
    };
  }
}
