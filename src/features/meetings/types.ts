import type { Database } from "@/types/database";

export type Meeting = Database["public"]["Tables"]["meetings"]["Row"];

export type MeetingSourceInput =
  | { type: "file"; file: File; sourceOrder: number }
  | { type: "pasted_text"; text: string; sourceOrder: number };

export interface CreateMeetingInput {
  projectId: string;
  title: string;
  meetingDate: string;
  meetingTime?: string | null;
  participants: string[];
  sources: MeetingSourceInput[];
}
