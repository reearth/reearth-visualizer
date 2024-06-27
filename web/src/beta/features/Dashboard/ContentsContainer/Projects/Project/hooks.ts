import { MouseEvent, useCallback, useState } from "react";

import { PopupMenuItem } from "@reearth/beta/lib/reearth-ui";
import useDoubleClick from "@reearth/beta/utils/use-double-click";
import { useT } from "@reearth/services/i18n";

import { Project as ProjectType } from "../../../type";

type Props = {
  project: ProjectType;
  selectedProjectId?: string;
  onProjectUpdate?: (project: ProjectType, projectId: string) => void;
  onProjectSelect?: (e?: MouseEvent<Element>, projectId?: string) => void;
};

export default ({ project, selectedProjectId, onProjectUpdate, onProjectSelect }: Props) => {
  const t = useT();

  const [isEditing, setIsEditing] = useState(false);
  const [projectName, setProjectName] = useState(project.name);
  const [isHovered, setIsHovered] = useState(false);

  const handleProjectNameChange = useCallback((newValue: string) => {
    setProjectName(newValue);
  }, []);

  const handleProjectNameBlur = useCallback(() => {
    if (!project || projectName === project.name) return setIsEditing(false);
    const updatedProject: ProjectType = {
      ...project,
      name: projectName,
    };
    onProjectUpdate?.(updatedProject, project.id);
    setIsEditing(false);
  }, [project, projectName, onProjectUpdate]);

  const handleProjectNameEdit = useCallback(() => {
    setIsEditing?.(true);
    if (selectedProjectId !== project.id || selectedProjectId) onProjectSelect?.(undefined);
  }, [onProjectSelect, project.id, selectedProjectId]);

  const popupMenu: PopupMenuItem[] = [
    {
      id: "rename",
      title: t("Rename"),
      icon: "pencilLine",
      onClick: () => handleProjectNameEdit?.(),
    },
    {
      id: "setting",
      title: t("Project Setting"),
      path: `/settings/project/${project.id}`,
      icon: "setting",
    },
  ];

  const [, handleDoubleClick] = useDoubleClick(
    () => {},
    () => handleProjectNameEdit(),
  );

  const handleOnHover = useCallback((value: boolean) => {
    setIsHovered(value);
  }, []);

  const handleProjectNameDoubleClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      handleDoubleClick();
    },
    [handleDoubleClick],
  );

  return {
    isEditing,
    projectName,
    isHovered,
    popupMenu,
    handleProjectNameChange,
    handleProjectNameBlur,
    handleOnHover,
    handleProjectNameDoubleClick,
  };
};
