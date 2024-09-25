import { PopupMenuItem } from "@reearth/beta/lib/reearth-ui";
import useDoubleClick from "@reearth/beta/utils/use-double-click";
import {
  useStorytellingFetcher,
  useProjectFetcher
} from "@reearth/services/api";
import { useT } from "@reearth/services/i18n";
import { MouseEvent, useCallback, useEffect, useMemo, useState } from "react";

import { Project as ProjectType } from "../../../type";
import { toPublishmentStatus } from "../hooks";

type Props = {
  project: ProjectType;
  selectedProjectId?: string;
  onProjectUpdate?: (project: ProjectType, projectId: string) => void;
  onProjectSelect?: (e?: MouseEvent<Element>, projectId?: string) => void;
};

export default ({
  project,
  selectedProjectId,
  onProjectUpdate,
  onProjectSelect
}: Props) => {
  const t = useT();
  const { useStoriesQuery } = useStorytellingFetcher();
  const { useExportProject } = useProjectFetcher();
  const { stories } = useStoriesQuery({ sceneId: project?.sceneId });

  const [isEditing, setIsEditing] = useState(false);
  const [projectName, setProjectName] = useState(project.name);
  const [isHovered, setIsHovered] = useState(false);
  const [isStarred, setIsStarred] = useState(project.starred);

  const handleProjectNameChange = useCallback((newValue: string) => {
    setProjectName(newValue);
  }, []);

  const handleProjectNameBlur = useCallback(() => {
    if (!project || projectName === project.name) return setIsEditing(false);
    const updatedProject: ProjectType = {
      ...project,
      name: projectName
    };
    onProjectUpdate?.(updatedProject, project.id);
    setIsEditing(false);
  }, [project, projectName, onProjectUpdate]);

  const handleProjectNameEdit = useCallback(() => {
    setIsEditing?.(true);
    if (selectedProjectId !== project.id || selectedProjectId)
      onProjectSelect?.(undefined);
  }, [onProjectSelect, project.id, selectedProjectId]);

  const handleExportProject = useCallback(async () => {
    if (!project.id) return;

    const result = await useExportProject(project.id);

    if (result.status === "success") {
      console.log("export success");
    } else {
      console.error("Failed to export project:", result.status);
    }
  }, [useExportProject, project.id]);

  useEffect(() => {
    setIsStarred(project.starred);
  }, [project.starred]);

  const popupMenu: PopupMenuItem[] = [
    {
      id: "rename",
      title: t("Rename"),
      icon: "pencilLine",
      onClick: () => handleProjectNameEdit?.()
    },
    {
      id: "setting",
      title: t("Project Setting"),
      path: `/settings/project/${project.id}`,
      icon: "setting"
    },
    {
      id: "export",
      title: t("Export"),
      icon: "downloadSimple",
      onClick: () => handleExportProject()
    }
  ];

  const [, handleDoubleClick] = useDoubleClick(
    () => {},
    () => handleProjectNameEdit()
  );

  const handleProjectHover = useCallback((value: boolean) => {
    setIsHovered(value);
  }, []);

  const handleProjectNameDoubleClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      handleDoubleClick();
    },
    [handleDoubleClick]
  );
  const handleProjectStarClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      setIsStarred(!isStarred);
      const updatedProject: ProjectType = {
        ...project,
        starred: !isStarred
      };
      onProjectUpdate?.(updatedProject, project.id);
    },
    [isStarred, onProjectUpdate, project]
  );

  const hasMapOrStoryPublished = useMemo(() => {
    const hasMapPublished =
      project.status === "published" || project.status === "limited";

    const hasStoryPublished = stories?.some((story) => {
      const publishmentStatus = toPublishmentStatus(story.publishmentStatus);
      return (
        publishmentStatus === "published" || publishmentStatus === "limited"
      );
    });

    return hasMapPublished || hasStoryPublished;
  }, [stories, project.status]);

  return {
    isEditing,
    projectName,
    isHovered,
    popupMenu,
    isStarred,
    hasMapOrStoryPublished,
    handleProjectNameChange,
    handleProjectNameBlur,
    handleProjectHover,
    handleProjectNameDoubleClick,
    handleProjectStarClick
  };
};
