import { ProjectType } from "@reearth/types";

export type Workspace = {
  id?: string;
  name?: string;
  personal?: boolean;
};

export type Project = {
  id?: string;
  name?: string;
  projectType?: ProjectType;
};
