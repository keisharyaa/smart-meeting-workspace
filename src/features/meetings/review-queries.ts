import { createClient } from "@/lib/supabase/server";

import type { MeetingDraftWithSources } from "./types";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getCurrentUserMeetingDraft(
  meetingId: string,
): Promise<{
  data: MeetingDraftWithSources | null;
  error: string | null;
}> {
  if (!uuidPattern.test(meetingId)) {
    return { data: null, error: null };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        data: null,
        error: "Please sign in to review this meeting.",
      };
    }

    const { data: meeting, error: meetingError } = await supabase
      .from("meetings")
      .select("*")
      .eq("id", meetingId)
      .eq("owner_id", user.id)
      .eq("is_published", false)
      .maybeSingle();

    if (meetingError) {
      throw meetingError;
    }

    if (!meeting) {
      return { data: null, error: null };
    }

    const { data: sources, error: sourcesError } = await supabase
      .from("meeting_sources")
      .select("*")
      .eq("meeting_id", meetingId)
      .eq("owner_id", user.id)
      .order("source_order", { ascending: true });

    if (sourcesError) {
      throw sourcesError;
    }

    return {
      data: { meeting, sources: sources ?? [] },
      error: null,
    };
  } catch (error) {
    console.error("Unable to load meeting draft:", error);
    return {
      data: null,
      error: "We could not load this meeting draft. Please try again.",
    };
  }
}
