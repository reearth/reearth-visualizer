import { useCallback, useEffect, useMemo, useState } from "react";

import generateRandomString from "@reearth/beta/utils/generate-random-string";
import { useProjectFetcher, useSceneFetcher } from "@reearth/services/api";

import { publishingType } from "./PublishModal";
import { type PublishStatus } from "./PublishModal/hooks";

export default ({ projectId, sceneId }: { projectId?: string; sceneId: string }) => {
  const {
    useProjectQuery,
    useProjectAliasCheckLazyQuery,
    usePublishProject,
    publishProjectLoading,
  } = useProjectFetcher();
  const { project } = useProjectQuery(projectId);
  const { useSceneQuery } = useSceneFetcher();

  const { scene } = useSceneQuery({ sceneId });
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

  const publishStatus: PublishStatus = useMemo(() => {
    const status =
      project?.publishmentStatus === "PUBLIC"
        ? "published"
        : project?.publishmentStatus === "LIMITED"
        ? "limited"
        : "unpublished";
    return status;
  }, [project?.publishmentStatus]);

  const publishStoryStatus = useMemo(() => {
    const status = scene?.stories.reduce((result, data) => {
      if (data.publishmentStatus === "PUBLIC") {
        return "published";
      } else if (data.publishmentStatus === "LIMITED") {
        return "limited";
      }
      return result;
    }, "unpublished");
    return status;
  }, [scene]);

  const handleProjectPublish = useCallback(
    async (alias: string | undefined, publishStatus: PublishStatus) => {
      await usePublishProject(publishStatus, projectId, alias);
    },
    [projectId, usePublishProject],
  );

  const handleOpenProjectSettings = useCallback(() => {
    setDropdown(false);
  }, []);

  const handleModalOpen = useCallback((p: publishingType) => {
    setPublishing(p);
    setDropdown(false);
    setModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModal(false);
  }, []);

  return {
    publishing,
    publishStatus,
    publishStoryStatus,
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
  };
};
