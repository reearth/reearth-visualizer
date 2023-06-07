import { ProjectType } from "@reearth/types";

export type User = {
  name: string;
};

export type Workspace = {
  id?: string;
  name?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  members?: Array<any>;
  policy?: {
    id: string;
    name: string;
  } | null;
};

export type Project = {
  id?: string;
  name?: string;
  projectType?: ProjectType;
};
