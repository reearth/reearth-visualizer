import { Status as StatusType } from "@reearth/classic/components/atoms/PublicationStatus";
import { ProjectType } from "@reearth/types";

export type User = {
  name: string;
};

export type Member = {
  user: {
    id?: string;
    name?: string;
  };
};

export type Workspace = {
  id?: string;
  name?: string;
  members?: Member[];
  policy?: {
    id: string;
    name: string;
  };
};

export type Status = StatusType;

export type Project = {
  id: string;
  name: string;
  image?: string | null;
  status: Status;
  isArchived?: boolean;
  description: string;
  sceneId?: string;
  updatedAt?: string;
  projectType?: ProjectType;
};
