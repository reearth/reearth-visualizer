import { ProjectPayload } from "@reearth/services/gql";

export type Project = ProjectPayload["project"];

export type ImportProjectResponse =
  | { status: "chunk_received"; project_id: string }
  | { status: "processing"; project_id: string }
  | { status: "success"; project_id: string }
  | { status: "error" };
