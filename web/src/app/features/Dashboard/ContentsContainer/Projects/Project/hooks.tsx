import useDoubleClick from "@reearth/app/hooks/useDoubleClick";
import { PopupMenuItem } from "@reearth/app/lib/reearth-ui";
import Tooltip from "@reearth/app/lib/reearth-ui/components/Tooltip";
import {
  useStorytellingFetcher,
  useProjectFetcher
} from "@reearth/services/api";
import { toPublishmentStatus } from "@reearth/services/api/publishTypes";
import { useT } from "@reearth/services/i18n";
import { MouseEvent, useCallback, useEffect, useMemo, useState } from "react";

import { Project as ProjectType } from "../../../type";

type Props = {
  project: ProjectType;
  selectedProjectId?: string;
  onProjectUpdate?: (project: ProjectType, projectId: string) => void;
  onProjectSelect?: (e?: MouseEvent<Element>, projectId?: string) => void;
  onProjectRemove?: (projectId: string) => void;
};

export default ({
  project,
  selectedProjectId,
  onProjectUpdate,
  onProjectSelect,
  onProjectRemove
}: Props) => {
  const t = useT();
  const { useStoriesQuery, usePublishStory } = useStorytellingFetcher();
  const { useExportProject, usePublishProject } = useProjectFetcher();
  const { stories } = useStoriesQuery(
    {
      sceneId: project?.sceneId
    },
    // We fetch stories only for check publish status, we can skip fetching stories if project is published already since the indicator shows when project OR any story is published
    { skip: project?.isPublished }
  );

  const [isEditing, setIsEditing] = useState(false);
  const [projectName, setProjectName] = useState(project.name);
  const [isHovered, setIsHovered] = useState(false);
  const [isStarred, setIsStarred] = useState(project.starred);
  const [projectRemoveModalVisible, setProjectRemoveModalVisible] =
    useState(false);

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

    await useExportProject(project.id);
  }, [useExportProject, project.id]);

  useEffect(() => {
    setIsStarred(project.starred);
  }, [project.starred]);

  const handleProjectRemoveModal = useCallback((value: boolean) => {
    setProjectRemoveModalVisible(value);
  }, []);

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
      path: `/settings/projects/${project.id}`,
      icon: "setting"
    },
    {
      id: "assets",
      title: t("Project Assets"),
      path: `/settings/projects/${project.id}/assets`,
      icon: "file"
    },
    {
      id: "export",
      title: t("Export"),
      icon: "downloadSimple",
      tileComponent: <Tooltip type="experimental" />,
      onClick: () => handleExportProject()
    },
    {
      id: "remove",
      title: t("Move to Recycle Bin"),
      icon: "trash",
      onClick: () => handleProjectRemoveModal(true)
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

  const projectPublished = useMemo(() => {
    return project.status === "published" || project.status === "limited";
  }, [project.status]);

  const storiesPublished = useMemo(() => {
    return stories?.some((story) => {
      const publishmentStatus = toPublishmentStatus(story.publishmentStatus);
      return (
        publishmentStatus === "published" || publishmentStatus === "limited"
      );
    });
  }, [stories]);

  const hasMapOrStoryPublished = useMemo(() => {
    return projectPublished || storiesPublished;
  }, [projectPublished, storiesPublished]);

  const handleProjectPublish = useCallback(
    async (projectId: string) => {
      if (projectPublished) {
        await usePublishProject("unpublished", projectId);
      }

      if (storiesPublished && stories?.length) {
        const storyPromises = stories.map((story) =>
          usePublishStory("unpublished", story.id)
        );
        await Promise.all(storyPromises);
      }
    },
    [
      projectPublished,
      stories,
      storiesPublished,
      usePublishProject,
      usePublishStory
    ]
  );

  const handleProjectRemove = useCallback(
    async (projectId: string) => {
      if (!projectId) return;
      handleProjectPublish(projectId);
      onProjectRemove?.(projectId);
      handleProjectRemoveModal(false);
    },
    [handleProjectRemoveModal, handleProjectPublish, onProjectRemove]
  );

  return {
    isEditing,
    projectName,
    isHovered,
    popupMenu,
    isStarred,
    hasMapOrStoryPublished,
    projectRemoveModalVisible,
    handleProjectNameChange,
    handleProjectNameBlur,
    handleProjectHover,
    handleProjectNameDoubleClick,
    handleProjectStarClick,
    handleExportProject,
    handleProjectRemoveModal,
    handleProjectRemove
  };
};
