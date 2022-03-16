import { useState, useEffect, useMemo, useCallback } from "react";

import { Status } from "@reearth/components/atoms/PublicationStatus";
import {
  useProjectQuery,
  useCheckProjectAliasLazyQuery,
  useUpdateProjectBasicAuthMutation,
  PublishmentStatus,
  usePublishProjectMutation,
  useUpdateProjectMutation,
} from "@reearth/gql";
import { useTeam, useProject } from "@reearth/state";

type Params = {
  projectId: string;
};

export default ({ projectId }: Params) => {
  const [currentTeam] = useTeam();
  const [currentProject] = useProject();

  const [updateProjectBasicAuthMutation] = useUpdateProjectBasicAuthMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [publishProjectMutation, { loading: loading }] = usePublishProjectMutation();
  const [validAlias, setValidAlias] = useState(false);
  const [projectAlias, setProjectAlias] = useState<string | undefined>();
  const teamId = currentTeam?.id;

  const { data } = useProjectQuery({
    variables: { teamId: teamId ?? "", first: 100 },
    skip: !teamId,
  });

  const rawProject = useMemo(
    () => data?.projects.nodes.find(p => p?.id === projectId),
    [data, projectId],
  );
  const project = useMemo(
    () =>
      rawProject?.id
        ? {
            id: rawProject.id,
            name: rawProject.name,
            description: rawProject.description,
            imageUrl: rawProject.imageUrl,
            publicTitle: rawProject.publicTitle ?? undefined,
            publicDescription: rawProject.publicDescription ?? undefined,
            publicImage: rawProject.publicImage ?? undefined,
            isArchived: rawProject.isArchived,
            isBasicAuthActive: rawProject.isBasicAuthActive,
            basicAuthUsername: rawProject.basicAuthUsername,
            basicAuthPassword: rawProject.basicAuthPassword,
            alias: rawProject.alias,
            publishmentStatus: rawProject.publishmentStatus,
          }
        : undefined,
    [rawProject],
  );

  useEffect(() => {
    if (!project) return;
    setProjectAlias(project?.alias);
  }, [project]);

  // Basic auth
  const updateProjectBasicAuth = useCallback(
    (isBasicAuthActive?: boolean, basicAuthUsername?: string, basicAuthPassword?: string) => {
      projectId &&
        updateProjectBasicAuthMutation({
          variables: { projectId, isBasicAuthActive, basicAuthUsername, basicAuthPassword },
        });
    },
    [projectId, updateProjectBasicAuthMutation],
  );

  // Alias
  const [checkProjectAliasQuery, { loading: validatingAlias, data: checkProjectAliasData }] =
    useCheckProjectAliasLazyQuery();
  const checkProjectAlias = useCallback(
    (alias: string) => {
      if (project?.alias && project.alias === alias) {
        setValidAlias(true);
        return;
      }
      return checkProjectAliasQuery({ variables: { alias } });
    },
    [checkProjectAliasQuery, project],
  );

  useEffect(() => {
    if (!project) return;
    setProjectAlias(project?.alias);
  }, [project]);

  useEffect(() => {
    setValidAlias(
      !validatingAlias &&
        !!project &&
        !!checkProjectAliasData &&
        (project.alias === checkProjectAliasData.checkProjectAlias.alias ||
          checkProjectAliasData.checkProjectAlias.available),
    );
  }, [validatingAlias, checkProjectAliasData, project]);

  // Public
  const updatePublicTitle = useCallback(
    (publicTitle?: string) => {
      if (!projectId || !publicTitle) return;
      updateProject({ variables: { projectId, publicTitle } });
    },
    [projectId, updateProject],
  );
  const updatePublicDescription = useCallback(
    (publicDescription?: string) => {
      if (!projectId || !publicDescription) return;
      updateProject({ variables: { projectId, publicDescription } });
    },
    [projectId, updateProject],
  );
  const updatePublicImage = useCallback(
    (publicImage?: string) => {
      projectId && updateProject({ variables: { projectId, publicImage } });
    },
    [projectId, updateProject],
  );

  // Publication
  const publishProject = useCallback(
    async (alias: string | undefined, s: Status) => {
      if (!projectId) return;
      const gqlStatus =
        s === "limited"
          ? PublishmentStatus.Limited
          : s == "published"
          ? PublishmentStatus.Public
          : PublishmentStatus.Private;
      await publishProjectMutation({
        variables: { projectId, alias, status: gqlStatus },
      });
    },
    [projectId, publishProjectMutation],
  );

  const [assetModalOpened, setOpenAssets] = useState(false);

  const toggleAssetModal = useCallback(
    (open?: boolean) => {
      if (!open) {
        setOpenAssets(!assetModalOpened);
      } else {
        setOpenAssets(open);
      }
    },
    [assetModalOpened, setOpenAssets],
  );

  return {
    currentTeam,
    currentProject,
    projectAlias,
    projectStatus: convertStatus(project?.publishmentStatus),
    project,
    updateProjectBasicAuth,
    publishProject,
    validAlias,
    checkProjectAlias,
    validatingAlias,
    loading,
    updatePublicTitle,
    updatePublicDescription,
    updatePublicImage,
    assetModalOpened,
    toggleAssetModal,
  };
};

const convertStatus = (status?: PublishmentStatus): Status | undefined => {
  switch (status) {
    case "PUBLIC":
      return "published";
    case "LIMITED":
      return "limited";
    case "PRIVATE":
      return "unpublished";
  }
  return undefined;
};
