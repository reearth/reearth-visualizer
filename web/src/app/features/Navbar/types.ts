import { ProjectType } from "@reearth/types";

export type Workspace = {
  id?: string;
  name?: string;
  alias?: string;
  personal?: boolean;
  photoURL?: string | null;
};

export type Project = {
  id?: string;
  name?: string;
  projectType?: ProjectType;
};
