import { PopupMenuItem } from "@reearth/beta/lib/reearth-ui";
import { useStorytellingFetcher } from "@reearth/services/api";
import { useT } from "@reearth/services/i18n";
import { MouseEvent, useCallback, useEffect, useMemo, useState } from "react";

import { Project as ProjectType } from "../../../type";
import { toPublishmentStatus } from "../hooks";

type Props = {
  project: ProjectType;
  selectedProjectId?: string;
  onArchiveProject?: (archive: boolean, projectId: string) => void;
  onProjectSelect?: (e?: MouseEvent<Element>, projectId?: string) => void;
};

export default ({ project, onArchiveProject }: Props) => {
  const t = useT();
  const { useStoriesQuery } = useStorytellingFetcher();
  const { stories } = useStoriesQuery({ sceneId: project?.sceneId });

  const [isHovered, setIsHovered] = useState(false);
  const [isStarred, setIsStarred] = useState(project.starred);

  useEffect(() => {
    setIsStarred(project.starred);
  }, [project.starred]);

  const popupMenu: PopupMenuItem[] = [
    {
      id: "archived",
      title: t("Restore from Trash"),
      icon: "trash",
      onClick: () => onArchiveProject?.(false, project.id)
    }
  ];

  const handleProjectHover = useCallback((value: boolean) => {
    setIsHovered(value);
  }, []);

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
    isHovered,
    popupMenu,
    isStarred,
    hasMapOrStoryPublished,
    handleProjectHover
  };
};
