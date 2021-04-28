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

export type Team = {
  id?: string;
  name?: string;
  members?: Member[];
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
};
