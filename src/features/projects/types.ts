import type { Database } from "@/types/database";

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
export type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];
export type ProjectStatus = Project["status"];

export interface ProjectFormInput {
  name: string;
  description?: string;
}

export interface ProjectListFilters {
  status?: ProjectStatus;
  search?: string;
}
