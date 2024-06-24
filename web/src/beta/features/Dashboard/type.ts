import { ProjectType } from "@reearth/types";

export type Project = {
  id: string;
  name: string;
  imageUrl?: string | null;
  status?: "published" | "limited" | "unpublished";
  isArchived?: boolean;
  description: string;
  sceneId?: string;
  updatedAt?: Date;
  projectType?: ProjectType;
};
