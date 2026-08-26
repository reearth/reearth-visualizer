import { ProjectType } from "@reearth/types";

export type Workspace = {
  id: string;
  name: string;
  alias?: string;
  personal?: boolean;
  photoURL?: string | null;
};

export type CurrentProject = {
  id?: string;
  name?: string;
  projectType?: ProjectType;
};

export type NavbarProject = {
  id: string;
  name: string;
  scene?: { id?: string | null } | null;
};
