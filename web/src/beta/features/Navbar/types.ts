import { ProjectType } from "@reearth/types";

export type User = {
  name: string;
};

export type Workspace = {
  id?: string;
  name?: string;
};

export type Project = {
  id?: string;
  name?: string;
  projectType?: ProjectType;
};
