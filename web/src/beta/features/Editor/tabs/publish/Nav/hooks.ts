import { useCallback, useEffect, useMemo, useState } from "react";

import { useSettingsNavigation } from "@reearth/beta/hooks";
import generateRandomString from "@reearth/beta/utils/generate-random-string";
import { useProjectFetcher, useStorytellingFetcher } from "@reearth/services/api";

import { publishingType } from "./PublishModal";
import { type PublishStatus } from "./PublishModal/hooks";

export type ProjectType = "default" | "story";

type SelectedProject = {
  id: string;
  alias?: string;
  publishmentStatus?: string;
};

export default ({
  id,
  sceneId,
  selectedProjectType,
}: {
  id?: string;
  sceneId?: string;
  selectedProjectType?: ProjectType;
}) => {
  const handleNavigationToSettings = useSettingsNavigation({ projectId: id });
  const [project, setProject] = useState<SelectedProject>();

  // Regular Project
  const {
    publishProjectLoading,
    useProjectQuery,
    useProjectAliasCheckLazyQuery,
    usePublishProject,
  } = useProjectFetcher();

  const { project: defaultProject } = useProjectQuery(id);

  // Storytelling Project
  const { useStoriesQuery, usePublishStory } = useStorytellingFetcher();

  const { stories } = useStoriesQuery({ sceneId });

  // General
  useEffect(() => {
    setProject(() => {
      const proj =
        selectedProjectType === "story" ? stories?.find(s => s.id === id) : defaultProject;
      return proj
        ? {
            id: proj.id,
            alias: proj.alias,
            publishmentStatus: proj.publishmentStatus,
          }
        : undefined;
    });
  }, [id, defaultProject, stories, selectedProjectType]);

  const [publishing, setPublishing] = useState<publishingType>("unpublishing");
  const [dropdownOpen, setDropdown] = useState(false);
  const [modalOpen, setModal] = useState(false);

  const generateAlias = useCallback(() => generateRandomString(10), []);

  const [validAlias, setValidAlias] = useState(false);
  const alias = useMemo(() => project?.alias ?? generateAlias(), [project?.alias, generateAlias]);

  const [checkProjectAlias, { loading: validatingAlias, data: checkProjectAliasData }] =
    useProjectAliasCheckLazyQuery();

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
      selectedProjectType === "story"
        ? await usePublishStory(publishStatus, project?.id, alias)
        : await usePublishProject(publishStatus, project?.id, alias);
    },
    [project?.id, selectedProjectType, usePublishStory, usePublishProject],
  );

  const handleOpenProjectSettings = useCallback(() => {
    handleNavigationToSettings?.("public");
    setDropdown(false);
  }, [handleNavigationToSettings]);

  const handleModalOpen = useCallback((p: publishingType) => {
    setPublishing(p);
    setDropdown(false);
    setModal(true);
  }, []);

  const handleModalClose = useCallback(() => setModal(false), []);

  return {
    publishing,
    publishStatus,
    publishProjectLoading,
    dropdownOpen,
    modalOpen,
    alias,
    validAlias,
    validatingAlias,
    handleModalOpen,
    handleModalClose,
    setDropdown,
    handleProjectPublish,
    handleProjectAliasCheck,
    handleOpenProjectSettings,
    handleNavigationToSettings,
  };
};
