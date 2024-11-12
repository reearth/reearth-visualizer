import {
  useProjectFetcher,
  useStorytellingFetcher
} from "@reearth/services/api";
import { PublishmentStatus } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";
import { useCallback, useMemo, useState } from "react";

import { SubProject } from "../../hooks/useUI";

export type PublishItem = {
  id: string;
  projectId: string;
  storyId?: string;
  type: "scene" | "story";
  buttonTitle: string;
  alias: string | undefined;
  publishmentStatus?: PublishmentStatus;
  isPublished: boolean;
};

export default ({
  projectId,
  sceneId,
  activeSubProject,
  handleActiveSubProjectChange
}: {
  projectId?: string;
  sceneId?: string;
  activeSubProject?: SubProject | undefined;
  handleActiveSubProjectChange?: (subProject: SubProject | undefined) => void;
}) => {
  const { useProjectQuery } = useProjectFetcher();
  const { useStoriesQuery } = useStorytellingFetcher();

  const { project } = useProjectQuery(projectId);
  const { stories } = useStoriesQuery({ sceneId });

  const t = useT();

  const publishItems: PublishItem[] = useMemo(() => {
    if (!project) return [];
    return [
      {
        id: project.id,
        projectId: project.id,
        storyId: undefined,
        type: "scene" as const,
        buttonTitle: t("Scene"),
        alias: project.alias,
        publishmentStatus: project.publishmentStatus,
        isPublished: isPublished(project.publishmentStatus)
      },
      ...(stories ?? []).map((s) => ({
        id: s.id,
        projectId: project.id,
        storyId: s.id,
        type: "story" as const,
        buttonTitle: s.title !== "Default" && s.title ? s.title : t("Story"),
        alias: s.alias && s.alias !== project.alias ? s.alias : undefined, // correct existing alias, needs republish
        publishmentStatus: s.publishmentStatus,
        isPublished: isPublished(s.publishmentStatus)
      }))
    ];
  }, [stories, project, t]);

  // Note: the selection is managed by Editor
  const publishItem: PublishItem | undefined = useMemo(
    () => publishItems.find((item) => item.id === activeSubProject?.id),
    [publishItems, activeSubProject]
  );

  const handlePublishItemSelect = useCallback(
    (id: string) => {
      const item = publishItems.find((item) => item.id === id);
      if (!item) return;
      handleActiveSubProjectChange?.({
        id: item.id,
        type: item.type,
        projectId: item.projectId,
        storyId: item.storyId
      });
    },
    [publishItems, handleActiveSubProjectChange]
  );

  const [unpublishModalVisible, setUnpublishModalVisible] = useState(false);
  const [publishModalVisible, setPublishModalVisible] = useState(false);

  return {
    publishItems,
    publishItem,
    handlePublishItemSelect,
    unpublishModalVisible,
    setUnpublishModalVisible,
    publishModalVisible,
    setPublishModalVisible
  };
};

function isPublished(publishmentStatus?: PublishmentStatus): boolean {
  return publishmentStatus === "PUBLIC" || publishmentStatus === "LIMITED";
}
