import { ProjectPayload } from "@reearth/services/gql";

export type Project = ProjectPayload["project"];

export type ImportProjectResponse = 
  | { status: "chunk_received" }
  | { status: "processing" }
  | { status: "success"; project_id: string }
  | { status: "error" };
