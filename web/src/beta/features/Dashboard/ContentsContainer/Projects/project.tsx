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
  onStarClick: (e: MouseEvent<Element>, projectId: string) => void;
  onProjectOpen?: () => void;
  onProjectUpdate?: (project: ProjectType, projectId: string) => void;
  onProjectSelect?: (projectId: string) => void;
  onClickToRename?: (projectId: string) => void;
};

export const Project: FC<ProjectProps> = ({
  viewState,
  project,
  selectedProjectId,
  isStarred,
  onProjectOpen,
  onProjectUpdate,
  onProjectSelect,
  onStarClick,
}) => {
  const t = useT();

  const [isEditing, setIsEditing] = useState(false);
  const [projectName, setProjectName] = useState(project.name);
  const [isHovered, setIsHovered] = useState(false);

  const handleOnChange = useCallback((newValue: string) => {
    setProjectName(newValue);
  }, []);

  const handleOnBlur = useCallback(() => {
    if (!project || projectName === project.name) return setIsEditing(false);
    const updatedProject: ProjectType = {
      ...project,
      name: projectName,
    };
    onProjectUpdate?.(updatedProject, project.id);
    setIsEditing(false);
  }, [project, projectName, onProjectUpdate]);

  const handleRename = useCallback(() => {
    setIsEditing?.(true);
    if (selectedProjectId !== project.id || selectedProjectId) onProjectSelect?.("");
  }, [onProjectSelect, project.id, selectedProjectId, setIsEditing]);

  const popupMenu: PopupMenuItem[] = [
    {
      id: "rename",
      title: t("Rename"),
      icon: "pencilLine",
      onClick: () => handleRename?.(),
    },
    {
      id: "setting",
      title: t("Project Setting"),
      path: `/settings/project/${project.id}`,
      icon: "setting",
    },
  ];

  const [handleSingleClick, handleDoubleClick] = useDoubleClick(
    () => onProjectSelect?.(project.id),
    () => handleRename(),
  );

  const handleOnHover = useCallback((value: boolean) => {
    setIsHovered(value);
  }, []);

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
          onProjectSelect={handleSingleClick}
          onStarClick={onStarClick}
          onChange={handleOnChange}
          onBlur={handleOnBlur}
          onDoubleClick={handleDoubleClick}
          onHover={handleOnHover}
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
          onProjectSelect={handleSingleClick}
          onStarClick={onStarClick}
          onChange={handleOnChange}
          onBlur={handleOnBlur}
          onDoubleClick={handleDoubleClick}
          onHover={handleOnHover}
        />
      )}
    </>
  );
};
