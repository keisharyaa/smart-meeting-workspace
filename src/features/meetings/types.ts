import type { Database } from "@/types/database";

export type Meeting = Database["public"]["Tables"]["meetings"]["Row"];
export type MeetingSource =
  Database["public"]["Tables"]["meeting_sources"]["Row"];
export type Project =
  Database["public"]["Tables"]["projects"]["Row"];

export interface MeetingMetadataInput {
  projectId: string;
  title: string;
  meetingDate: string;
  meetingTime?: string | null;
  participants: string[];
}

export interface UploadedFileDescriptor {
  originalFileName: string;
  mimeType: string;
  fileSizeBytes: number;
  storagePath: string;
  sourceOrder: number;
}

export interface SignedUploadDescriptor extends UploadedFileDescriptor {
  token: string;
}

export interface CreateMeetingUploadPlan {
  meetingId: string;
  uploads: SignedUploadDescriptor[];
}

export interface FinalizeMeetingInput {
  meetingId: string;
  uploadedFiles: UploadedFileDescriptor[];
  pastedText?: string | null;
  pastedTextSourceOrder?: number | null;
}

export interface ActiveProjectOption {
  id: string;
  name: string;
}

export interface MeetingDraftWithSources {
  meeting: Meeting;
  sources: MeetingSource[];
}
