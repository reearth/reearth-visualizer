import { useProject } from "@reearth/services/api/project";
import { useStories } from "@reearth/services/api/storytelling";
import { PublishmentStatus } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n/hooks";
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
  const { project } = useProject(projectId);
  const { stories } = useStories({ sceneId });

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
        alias: project.scene?.alias,
        publishmentStatus: project.publishmentStatus,
        isPublished: isPublished(project.publishmentStatus)
      },
      // Memo: we only have one story now
      ...(stories ?? []).map((s) => ({
        id: s.id,
        projectId: project.id,
        storyId: s.id,
        type: "story" as const,
        buttonTitle: t("Story"),
        alias: s.alias,
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
