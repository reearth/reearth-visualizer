import { useCallback, useMemo, useState } from "react";

import generateRandomString from "@reearth/beta/utils/generate-random-string";
import { useProjectFetcher } from "@reearth/services/api";

import { type PublishStatus } from ".";

export default ({ projectId }: { projectId?: string }) => {
  const { useProjectQuery, usePublishProject } = useProjectFetcher();
  const { project } = useProjectQuery(projectId);

  const [dropdownOpen, setDropdown] = useState(false);

  const generateAlias = useCallback(() => generateRandomString(10), []);

  const alias = useMemo(() => project?.alias ?? generateAlias(), [project?.alias, generateAlias]);

  const publishStatus: PublishStatus = useMemo(() => {
    const status =
      project?.publishmentStatus === "PUBLIC"
        ? "published"
        : project?.publishmentStatus === "LIMITED"
        ? "limited"
        : "unpublished";
    return status;
  }, [project?.publishmentStatus]);

  const handleProjectPublish = useCallback(
    async (publishStatus: PublishStatus) => {
      console.log("publish");
      await usePublishProject(publishStatus, projectId, alias);
      setDropdown(false);
    },
    [projectId, alias, usePublishProject],
  );

  const handleProjectUnpublish = useCallback(() => {
    console.log("unpublish");
    if (project?.publishmentStatus === "PRIVATE") return;
    handleProjectPublish("unpublished");
    setDropdown(false);
  }, [project?.publishmentStatus, handleProjectPublish]);

  const handleOpenProjectSettings = useCallback(() => {
    console.log("open settings");
    setDropdown(false);
  }, []);

  return {
    publishStatus,
    dropdownOpen,
    setDropdown,
    handleProjectPublish,
    handleProjectUnpublish,
    handleOpenProjectSettings,
  };
};
