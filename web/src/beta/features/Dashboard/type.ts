import { IconName } from "@reearth/beta/lib/reearth-ui";
import { PublishStatus } from "@reearth/services/api/publishTypes";
import { TeamMember } from "@reearth/services/gql";
import { ProjectType } from "@reearth/types";
import { ReactNode } from "react";

export type Project = {
  id: string;
  name: string;
  imageUrl?: string | null;
  status?: PublishStatus;
  isArchived?: boolean;
  description?: string;
  sceneId?: string;
  updatedAt?: Date;
  createdAt?: Date;
  projectType?: ProjectType;
  starred?: boolean;
  isDeleted?: boolean;
  isPublished?: boolean;
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
  tileComponent?: ReactNode;
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
