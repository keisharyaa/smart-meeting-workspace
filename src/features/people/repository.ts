import { createClient } from "@/lib/supabase/server";

import type {
  PeopleActionItem,
  PeopleActionItemRecord,
  PeopleMeeting,
  PeopleProject,
  PicInformationInput,
  PeopleRecord,
} from "./types";

type PersonRow = {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
};

type MeetingRow = {
  id: string;
  title: string;
  meeting_date: string;
  is_published: boolean;
};

export async function listPeopleFromOfficialActionItems(
  ownerId: string,
): Promise<PeopleRecord[]> {
  const supabase = await createClient();

  const { data: actionItems, error } = await supabase
    .from("action_items")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("is_official", true)
    .not("published_at", "is", null)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load People Directory.");
  }

  const officialPicActionItems = (actionItems ?? []).filter(hasPicIdentity);

  if (officialPicActionItems.length === 0) {
    return [];
  }

  const [peopleById, projectNameById, meetingsById] = await Promise.all([
    loadPeopleById(ownerId, officialPicActionItems),
    loadProjectNamesById(ownerId, officialPicActionItems),
    loadMeetingsById(ownerId, officialPicActionItems),
  ]);

  return buildPeopleRecords({
    actionItems: officialPicActionItems,
    peopleById,
    projectNameById,
    meetingsById,
  });
}

export async function getPersonFromOfficialActionItems(
  ownerId: string,
  personKey: string,
): Promise<PeopleRecord | null> {
  const people = await listPeopleFromOfficialActionItems(ownerId);

  return people.find((person) => person.key === personKey) ?? null;
}

export async function updatePicInformation(
  ownerId: string,
  personKey: string,
  input: PicInformationInput,
): Promise<string> {
  const supabase = await createClient();
  const currentPerson = await getPersonFromOfficialActionItems(ownerId, personKey);

  if (!currentPerson) {
    throw new Error("PIC is not available.");
  }

  if (currentPerson.personId) {
    const { data, error } = await supabase
      .from("people")
      .update({
        name: input.fullName,
        email: input.email,
        role: input.role,
      })
      .eq("id", currentPerson.personId)
      .eq("owner_id", ownerId)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      throw new Error("Unable to update PIC information.");
    }

    const relatedActionItemIds = currentPerson.actionItems.map(
      ({ actionItem }) => actionItem.id,
    );
    const { error: actionItemsError } = await supabase
      .from("action_items")
      .update({
        person_id: currentPerson.personId,
        pic_name: input.fullName,
      })
      .eq("owner_id", ownerId)
      .eq("is_official", true)
      .in("id", relatedActionItemIds);

    if (actionItemsError) {
      throw new Error("Unable to update related action items.");
    }

    return `pic-${slugify(input.fullName)}`;
  }

  const reusedPerson = await findReusablePerson(ownerId, input);
  const personId = reusedPerson?.id ?? (await createPerson(ownerId, input));
  const relatedActionItemIds = currentPerson.actionItems.map(
    ({ actionItem }) => actionItem.id,
  );

  const { error: actionItemsError } = await supabase
    .from("action_items")
    .update({
      person_id: personId,
      pic_name: input.fullName,
    })
    .eq("owner_id", ownerId)
    .eq("is_official", true)
    .in("id", relatedActionItemIds);

  if (actionItemsError) {
    throw new Error("Unable to connect official action items to this PIC.");
  }

  return `pic-${slugify(input.fullName)}`;
}

function hasPicIdentity(actionItem: PeopleActionItem) {
  return Boolean(actionItem.person_id || actionItem.pic_name?.trim());
}

async function loadPeopleById(
  ownerId: string,
  actionItems: PeopleActionItem[],
) {
  const personIds = [
    ...new Set(
      actionItems
        .map((actionItem) => actionItem.person_id)
        .filter((personId): personId is string => Boolean(personId)),
    ),
  ];

  if (personIds.length === 0) {
    return new Map<string, PersonRow>();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("people")
    .select("id, name, email, role")
    .eq("owner_id", ownerId)
    .in("id", personIds);

  if (error) {
    throw new Error("Unable to load PIC information.");
  }

  return new Map((data ?? []).map((person) => [person.id, person]));
}

async function loadProjectNamesById(
  ownerId: string,
  actionItems: PeopleActionItem[],
) {
  const projectIds = [
    ...new Set(actionItems.map((actionItem) => actionItem.project_id)),
  ];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name")
    .eq("owner_id", ownerId)
    .in("id", projectIds);

  if (error) {
    throw new Error("Unable to load related projects.");
  }

  return new Map((data ?? []).map((project) => [project.id, project.name]));
}

async function loadMeetingsById(
  ownerId: string,
  actionItems: PeopleActionItem[],
) {
  const meetingIds = [
    ...new Set(
      actionItems
        .map((actionItem) => actionItem.meeting_id)
        .filter((meetingId): meetingId is string => Boolean(meetingId)),
    ),
  ];

  if (meetingIds.length === 0) {
    return new Map<string, MeetingRow>();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meetings")
    .select("id, title, meeting_date, is_published")
    .eq("owner_id", ownerId)
    .in("id", meetingIds);

  if (error) {
    throw new Error("Unable to load related meetings.");
  }

  return new Map((data ?? []).map((meeting) => [meeting.id, meeting]));
}

function buildPeopleRecords({
  actionItems,
  peopleById,
  projectNameById,
  meetingsById,
}: {
  actionItems: PeopleActionItem[];
  peopleById: Map<string, PersonRow>;
  projectNameById: Map<string, string>;
  meetingsById: Map<string, MeetingRow>;
}) {
  const peopleByKey = new Map<string, PeopleRecord>();

  for (const actionItem of actionItems) {
    const person = actionItem.person_id
      ? peopleById.get(actionItem.person_id)
      : null;
    const fullName = person?.name ?? actionItem.pic_name?.trim() ?? "Unknown PIC";
    const key = `pic-${slugify(fullName)}`;
    const existing = peopleByKey.get(key);
    const projectName =
      projectNameById.get(actionItem.project_id) ?? "Unknown project";
    const meeting = actionItem.meeting_id
      ? meetingsById.get(actionItem.meeting_id)
      : null;
    const actionRecord: PeopleActionItemRecord = {
      actionItem,
      projectName,
      meetingTitle: meeting?.title ?? null,
    };

    if (existing) {
      existing.personId = existing.personId ?? person?.id ?? null;
      existing.email = existing.email ?? person?.email ?? null;
      existing.role = existing.role ?? person?.role ?? null;
      existing.actionItems.push(actionRecord);
      continue;
    }

    peopleByKey.set(key, {
      key,
      personId: person?.id ?? null,
      fullName,
      email: person?.email ?? null,
      role: person?.role ?? null,
      openActionItemCount: 0,
      completedActionItemCount: 0,
      relatedProjects: [],
      relatedPublishedMeetings: [],
      actionItems: [actionRecord],
    });
  }

  for (const person of peopleByKey.values()) {
    person.openActionItemCount = person.actionItems.filter(({ actionItem }) =>
      isOpenStatus(actionItem.status),
    ).length;
    person.completedActionItemCount = person.actionItems.filter(
      ({ actionItem }) => actionItem.status === "done",
    ).length;
    person.relatedProjects = uniqueProjects(person.actionItems);
    person.relatedPublishedMeetings = uniquePublishedMeetings(
      person.actionItems,
      meetingsById,
    );
  }

  return [...peopleByKey.values()].sort((a, b) =>
    a.fullName.localeCompare(b.fullName),
  );
}

async function findReusablePerson(
  ownerId: string,
  input: PicInformationInput,
): Promise<PersonRow | null> {
  const supabase = await createClient();

  if (input.email) {
    const { data, error } = await supabase
      .from("people")
      .select("id, name, email, role")
      .eq("owner_id", ownerId)
      .ilike("email", input.email)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error("Unable to check existing PIC information.");
    }

    if (data) {
      return data;
    }
  }

  const { data, error } = await supabase
    .from("people")
    .select("id, name, email, role")
    .eq("owner_id", ownerId)
    .ilike("name", input.fullName)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to check existing PIC information.");
  }

  return data;
}

async function createPerson(
  ownerId: string,
  input: PicInformationInput,
): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("people")
    .insert({
      owner_id: ownerId,
      name: input.fullName,
      email: input.email,
      role: input.role,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error("Unable to create PIC information.");
  }

  return data.id;
}

function isOpenStatus(status: PeopleActionItem["status"]) {
  return status === "todo" || status === "in_progress" || status === "blocked";
}

function uniqueProjects(actionItems: PeopleActionItemRecord[]): PeopleProject[] {
  const projectsById = new Map<string, PeopleProject>();

  for (const { actionItem, projectName } of actionItems) {
    projectsById.set(actionItem.project_id, {
      id: actionItem.project_id,
      name: projectName,
    });
  }

  return [...projectsById.values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

function uniquePublishedMeetings(
  actionItems: PeopleActionItemRecord[],
  meetingsById: Map<string, MeetingRow>,
): PeopleMeeting[] {
  const meetingsByIdForPerson = new Map<string, PeopleMeeting>();

  for (const { actionItem } of actionItems) {
    if (!actionItem.meeting_id) {
      continue;
    }

    const meeting = meetingsById.get(actionItem.meeting_id);

    if (!meeting?.is_published) {
      continue;
    }

    meetingsByIdForPerson.set(meeting.id, {
      id: meeting.id,
      title: meeting.title,
      meetingDate: meeting.meeting_date,
      isPublished: meeting.is_published,
    });
  }

  return [...meetingsByIdForPerson.values()].sort((a, b) =>
    b.meetingDate.localeCompare(a.meetingDate),
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
