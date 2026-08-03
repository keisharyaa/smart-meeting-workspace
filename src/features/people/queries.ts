import { createClient } from "@/lib/supabase/server";

import {
  getPersonFromOfficialActionItems,
  listPeopleFromOfficialActionItems,
} from "./repository";
import type { PeopleRecord } from "./types";

export interface PeopleDirectoryPageData {
  people: PeopleRecord[];
  error: string | null;
}

export interface PersonDetailPageData {
  person: PeopleRecord | null;
  error: string | null;
}

export async function getCurrentUserPeopleDirectory(): Promise<PeopleDirectoryPageData> {
  try {
    const ownerId = await getCurrentUserId();

    if (!ownerId) {
      return {
        people: [],
        error: "Please sign in to view People Directory.",
      };
    }

    return {
      people: await listPeopleFromOfficialActionItems(ownerId),
      error: null,
    };
  } catch (error) {
    console.error("Unable to load People Directory:", error);

    return {
      people: [],
      error: "We could not load People Directory. Please try again.",
    };
  }
}

export async function getCurrentUserPersonDetail(
  personKey: string,
): Promise<PersonDetailPageData> {
  try {
    const ownerId = await getCurrentUserId();

    if (!ownerId) {
      return {
        person: null,
        error: "Please sign in to view People Directory.",
      };
    }

    return {
      person: await getPersonFromOfficialActionItems(ownerId, personKey),
      error: null,
    };
  } catch (error) {
    console.error("Unable to load person detail:", error);

    return {
      person: null,
      error: "We could not load this PIC. Please try again.",
    };
  }
}

async function getCurrentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user.id;
}

