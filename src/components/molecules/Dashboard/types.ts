import { Status as StatusType } from "@reearth/components/atoms/PublicationStatus";

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
};
