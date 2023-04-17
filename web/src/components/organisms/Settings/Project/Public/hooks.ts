import { useState, useEffect, useMemo, useCallback } from "react";

import { Status } from "@reearth/components/atoms/PublicationStatus";
import {
  useGetProjectQuery,
  useCheckProjectAliasLazyQuery,
  useUpdateProjectBasicAuthMutation,
  PublishmentStatus,
  usePublishProjectMutation,
  useUpdateProjectMutation,
} from "@reearth/gql";
import { useLang as useCurrentLang } from "@reearth/i18n";
import {
  useWorkspace,
  useProject,
  useNotification,
  NotificationType,
  useCurrentTheme as useCurrentTheme,
} from "@reearth/state";

type Params = {
  projectId: string;
};

export default ({ projectId }: Params) => {
  const [currentWorkspace] = useWorkspace();
  const [currentProject] = useProject();
  const [, setNotification] = useNotification();

  const [validAlias, setValidAlias] = useState(false);
  const [projectAlias, setProjectAlias] = useState<string | undefined>();

  const [updateProjectBasicAuthMutation] = useUpdateProjectBasicAuthMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [publishProjectMutation, { loading: loading }] = usePublishProjectMutation();

  const { data } = useGetProjectQuery({
    variables: { projectId: projectId ?? "" },
    skip: !projectId,
  });

  const project = useMemo(
    () =>
      data?.node?.__typename === "Project"
        ? {
            id: data.node.id,
            name: data.node.name,
            description: data.node.description,
            imageUrl: data.node.imageUrl,
            publicTitle: data.node.publicTitle ?? undefined,
            publicDescription: data.node.publicDescription ?? undefined,
            publicImage: data.node.publicImage ?? undefined,
            isArchived: data.node.isArchived,
            isBasicAuthActive: data.node.isBasicAuthActive,
            basicAuthUsername: data.node.basicAuthUsername,
            basicAuthPassword: data.node.basicAuthPassword,
            alias: data.node.alias,
            publishmentStatus: data.node.publishmentStatus,
          }
        : undefined,
    [data?.node],
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

  const handleNotificationChange = useCallback(
    (type: NotificationType, text: string, heading?: string) => {
      setNotification({ type, text, heading });
    },
    [setNotification],
  );

  const currentLang = useCurrentLang();
  const [currentTheme] = useCurrentTheme();

  return {
    currentWorkspace,
    currentProject,
    projectAlias,
    projectStatus: convertStatus(project?.publishmentStatus),
    project,
    validAlias,
    validatingAlias,
    loading,
    assetModalOpened,
    currentLang,
    currentTheme,
    updateProjectBasicAuth,
    publishProject,
    checkProjectAlias,
    updatePublicTitle,
    updatePublicDescription,
    updatePublicImage,
    toggleAssetModal,
    handleNotificationChange,
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
