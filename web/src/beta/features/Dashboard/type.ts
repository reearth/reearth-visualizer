import { IconName } from "@reearth/beta/lib/reearth-ui";
import { TeamMember } from "@reearth/services/gql";
import { ProjectType } from "@reearth/types";

export type Project = {
  id: string;
  name: string;
  imageUrl?: string | null;
  status?: "published" | "limited" | "unpublished";
  isArchived?: boolean;
  description?: string;
  sceneId?: string;
  updatedAt?: Date;
  createdAt?: Date;
  projectType?: ProjectType;
  starred?: boolean;
  isDeleted?: boolean;
};

export type DeletedProject = {
  id: string;
  name: string;
  imageUrl?: string | null;
  isDeleted?: boolean;
};

export type TabItems = {
  id: string;
  text?: string;
  icon?: IconName;
  path?: string;
  active?: boolean;
  disabled?: boolean;
};

export type User = {
  id: string;
  name: string;
  email?: string;
};

export type Member = {
  role: string;
  userId: string;
  user?: User;
};

export type Workspace = {
  id: string;
  name: string;
  members?: TeamMember[];
  policyId?: string | null;
  policy?: { id: string; name: string } | null;
  personal?: boolean;
};
