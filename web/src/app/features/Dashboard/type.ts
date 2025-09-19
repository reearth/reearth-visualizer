import { IconName } from "@reearth/app/lib/reearth-ui";
import { PublishStatus } from "@reearth/services/api/utils";
import { ProjectImportStatus, WorkspaceMember } from "@reearth/services/gql";
import { ProjectType } from "@reearth/types";
import { ReactNode } from "react";

export type ImportStatus = "failed" | "none" | "processing" | "success";

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
  workspaceId: string;
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
  visibility?: string;
  projectAlias?: string;
};

export type DeletedProject = {
  id: string;
  name: string;
  imageUrl?: string | null;
  isDeleted?: boolean;
  visibility?: string;
  starred?: boolean;
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
  alias?: string;
  members?: WorkspaceMember[];
  policyId?: string | null;
  policy?: { id: string; name: string } | null;
  personal?: boolean;
};

// export const getImportStatus = (s?: ProjectImportStatus | null) => {
//   switch (s) {
//     case ProjectImportStatus.Failed:
//       return "failed";
//     case ProjectImportStatus.Success:
//       return "success";
//     case ProjectImportStatus.Processing:
//       return "processing";
//     default:
//       return "none";
//   }
// };
