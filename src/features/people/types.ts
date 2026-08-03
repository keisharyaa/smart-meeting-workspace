import type { Database } from "@/types/database";

export type PeopleActionItem =
  Database["public"]["Tables"]["action_items"]["Row"];

export type PeopleActionItemStatus = PeopleActionItem["status"];
export type PeopleActionItemPriority = PeopleActionItem["priority"];

export interface PeopleProject {
  id: string;
  name: string;
}

export interface PeopleMeeting {
  id: string;
  title: string;
  meetingDate: string;
  isPublished: boolean;
}

export interface PeopleRecord {
  key: string;
  personId: string | null;
  fullName: string;
  email: string | null;
  role: string | null;
  openActionItemCount: number;
  completedActionItemCount: number;
  relatedProjects: PeopleProject[];
  relatedPublishedMeetings: PeopleMeeting[];
  actionItems: PeopleActionItemRecord[];
}

export interface PicInformationInput {
  fullName: string;
  email: string | null;
  role: string | null;
}

export interface PeopleActionItemRecord {
  actionItem: PeopleActionItem;
  projectName: string;
  meetingTitle: string | null;
}
