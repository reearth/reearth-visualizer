import { IconName } from "@reearth/beta/lib/reearth-ui";
import { PublishStatus } from "@reearth/services/api/publishTypes";
import { ProjectImportStatus, TeamMember } from "@reearth/services/gql";
import { ProjectType } from "@reearth/types";
import { ReactNode } from "react";

export type importStatus =
  | "failed"
  | "none"
  | "processing"
  | "success";

export type ProjectMetadata = {
  id: string;
  project: string;
  workspace: string;
  readme?: string | null;
  license?: string | null;
  importStatus?: ProjectImportStatus | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type Project = {
  id: string;
  name: string;
  teamId: string;
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
  metadata?: ProjectMetadata | null;
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

export const checkImportStatus = (s?: ProjectImportStatus) => {
  switch (s) {
    case ProjectImportStatus.Failed:
      return "failed";
    case ProjectImportStatus.Success:
      return "success";
    case ProjectImportStatus.Processing:
      return "processing";
    default:
      return "none";
  }
};