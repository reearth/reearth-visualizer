import { FC, MouseEvent, useCallback, useState } from "react";

import { PopupMenuItem } from "@reearth/beta/lib/reearth-ui";
import useDoubleClick from "@reearth/beta/utils/use-double-click";
import { useT } from "@reearth/services/i18n";

import { Project as ProjectType } from "../../type";

import { GridLayout } from "./gridLayout";
import { ListLayout } from "./listLayout";

type ProjectProps = {
  viewState: string;
  project: ProjectType;
  selectedProjectId?: string;
  isStarred?: boolean;
  onProjectStarClick: (e: MouseEvent<Element>, projectId: string) => void;
  onProjectOpen?: () => void;
  onProjectUpdate?: (project: ProjectType, projectId: string) => void;
  onProjectSelect?: (e?: MouseEvent<Element>, projectId?: string) => void;
  onProjectRename?: (projectId: string) => void;
};

export const Project: FC<ProjectProps> = ({
  viewState,
  project,
  selectedProjectId,
  isStarred,
  onProjectOpen,
  onProjectUpdate,
  onProjectSelect,
  onProjectStarClick,
}) => {
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

  return (
    <>
      {viewState === "grid" && (
        <GridLayout
          project={project}
          isStarred={isStarred}
          selectedProjectId={selectedProjectId}
          isEditing={isEditing}
          projectName={projectName}
          popupMenu={popupMenu}
          isHovered={isHovered}
          onProjectOpen={onProjectOpen}
          onProjectUpdate={onProjectUpdate}
          onProjectSelect={(e: MouseEvent<Element>) => onProjectSelect?.(e, project.id)}
          onProjectStarClick={onProjectStarClick}
          onProjectChange={handleProjectNameChange}
          onProjectBlur={handleProjectNameBlur}
          onProjectNameEdit={handleProjectNameDoubleClick}
          onProjectHover={handleOnHover}
        />
      )}
      {viewState === "list" && (
        <ListLayout
          project={project}
          isStarred={isStarred}
          selectedProjectId={selectedProjectId}
          isEditing={isEditing}
          projectName={projectName}
          popupMenu={popupMenu}
          isHovered={isHovered}
          onProjectOpen={onProjectOpen}
          onProjectUpdate={onProjectUpdate}
          onProjectSelect={(e: MouseEvent<Element>) => onProjectSelect?.(e, project.id)}
          onProjectStarClick={onProjectStarClick}
          onProjectChange={handleProjectNameChange}
          onProjectBlur={handleProjectNameBlur}
          onProjectNameEdit={handleProjectNameDoubleClick}
          onProjectHover={handleOnHover}
        />
      )}
    </>
  );
};
