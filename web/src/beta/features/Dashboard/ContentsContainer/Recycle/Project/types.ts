import { MouseEvent } from "react";

import { Project as ProjectType } from "../../../type";

export type ProjectProps = {
  project: ProjectType;
  selectedProjectId?: string;
  onProjectOpen?: () => void;
  onProjectSelect?: (e?: MouseEvent<Element>, projectId?: string) => void;
  onArchiveProject?: (archive: boolean, projectId: string) => void;
};
