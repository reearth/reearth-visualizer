import { useSettingsNavigation } from "@reearth/beta/hooks";
import generateRandomString from "@reearth/beta/utils/generate-random-string";
import {
  useProjectFetcher,
  useStorytellingFetcher,
} from "@reearth/services/api";
import { useCallback, useEffect, useMemo, useState } from "react";

import { publishingType } from "./PublishModal";
import { type PublishStatus } from "./PublishModal/hooks";

export type ProjectType = "default" | "story";

type SelectedProject = {
  id: string;
  alias?: string;
  publishmentStatus?: string;
};

export default ({
  storyId,
  projectId,
  sceneId,
  selectedProjectType,
}: {
  storyId?: string;
  projectId?: string;
  sceneId?: string;
  selectedProjectType?: ProjectType;
}) => {
  const handleNavigationToSettings = useSettingsNavigation({ projectId });

  // Regular Project
  const {
    publishProjectLoading,
    useProjectQuery,
    useProjectAliasCheckLazyQuery,
    usePublishProject,
  } = useProjectFetcher();

  const { project: mapProject } = useProjectQuery(projectId);

  // Storytelling Project
  const { useStoriesQuery, usePublishStory } = useStorytellingFetcher();

  const { stories } = useStoriesQuery({ sceneId });

  const project: SelectedProject | undefined = useMemo(() => {
    if (selectedProjectType === "story") {
      const story = stories?.find((s) => s.id === storyId);
      return story
        ? {
            id: story.id,
            alias: story.alias,
            publishmentStatus: story.publishmentStatus,
          }
        : undefined;
    } else {
      return mapProject
        ? {
            id: mapProject.id,
            alias: mapProject.alias,
            publishmentStatus: mapProject.publishmentStatus,
          }
        : undefined;
    }
  }, [stories, storyId, selectedProjectType, mapProject]);

  const [publishing, setPublishing] = useState<publishingType>("unpublishing");
  const [modalOpen, setModal] = useState(false);

  const generateAlias = useCallback(() => generateRandomString(10), []);

  const [validAlias, setValidAlias] = useState(false);
  const alias = useMemo(
    () => project?.alias ?? generateAlias(),
    [project?.alias, generateAlias],
  );

  const [
    checkProjectAlias,
    { loading: validatingAlias, data: checkProjectAliasData },
  ] = useProjectAliasCheckLazyQuery();

  const publishmentStatuses = useMemo(() => {
    return [
      {
        id: "map",
        title: "Scene",
        type: "default",
        published: isPublished(mapProject?.publishmentStatus),
      },
      ...(stories?.map((s) => ({
        id: s.id,
        title: "Story",
        type: "story",
        published: isPublished(s.publishmentStatus),
      })) || []),
    ];
  }, [mapProject, stories]);

  const handleProjectAliasCheck = useCallback(
    (a: string) => {
      if (project?.alias === a) {
        setValidAlias(true);
      } else {
        checkProjectAlias({ variables: { alias: a } });
      }
    },
    [project?.alias, checkProjectAlias],
  );

  useEffect(() => {
    setValidAlias(
      !validatingAlias &&
        !!project &&
        !!checkProjectAliasData &&
        (project.alias === checkProjectAliasData.checkProjectAlias.alias ||
          checkProjectAliasData.checkProjectAlias.available),
    );
  }, [validatingAlias, checkProjectAliasData, project]);

  const publishStatus: PublishStatus = useMemo(
    () =>
      project?.publishmentStatus === "PUBLIC"
        ? "published"
        : project?.publishmentStatus === "LIMITED"
          ? "limited"
          : "unpublished",
    [project?.publishmentStatus],
  );

  const handleProjectPublish = useCallback(
    async (alias: string | undefined, publishStatus: PublishStatus) => {
      if (selectedProjectType === "story") {
        await usePublishStory(publishStatus, project?.id, alias);
      } else {
        await usePublishProject(publishStatus, project?.id, alias);
      }
    },
    [project?.id, selectedProjectType, usePublishStory, usePublishProject],
  );

  const handleModalOpen = useCallback((p: publishingType) => {
    setPublishing(p);
    setModal(true);
  }, []);

  const handleModalClose = useCallback(() => setModal(false), []);

  return {
    publishmentStatuses,
    publishing,
    publishStatus,
    publishProjectLoading,
    modalOpen,
    alias,
    validAlias,
    validatingAlias,
    handleModalOpen,
    handleModalClose,
    handleProjectPublish,
    handleProjectAliasCheck,
    handleNavigationToSettings,
  };
};

function isPublished(publishmentStatus?: string) {
  return publishmentStatus === "PUBLIC" || publishmentStatus === "LIMITED";
}
