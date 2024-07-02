import { MouseEvent } from "react";

import { Project as ProjectType } from "../../../type";

export type ProjectProps = {
  project: ProjectType;
  selectedProjectId?: string;
  isStarred?: boolean;
  onProjectOpen?: () => void;
  onProjectSelect?: (e?: MouseEvent<Element>, projectId?: string) => void;
  onProjectStarClick?: (e: MouseEvent<Element>, projectId: string) => void;
  onProjectUpdate?: (project: ProjectType, projectId: string) => void;
};
