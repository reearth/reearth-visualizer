import { useCallback, useMemo, useState, useEffect } from "react";
import {
  useProjectQuery,
  useUpdateProjectNameMutation,
  useUpdateProjectDescriptionMutation,
  useUpdateProjectImageUrlMutation,
  PublishmentStatus,
  usePublishProjectMutation,
  useCheckProjectAliasLazyQuery,
  useArchiveProjectMutation,
  useDeleteProjectMutation,
  useUpdateProjectBasicAuthMutation,
  useCreateAssetMutation,
  AssetsQuery,
  useAssetsQuery,
} from "@reearth/gql";
import { useLocalState } from "@reearth/state";

import { Status } from "@reearth/components/atoms/PublicationStatus";

export type AssetNodes = NonNullable<AssetsQuery["assets"]["nodes"][number]>[];

type Params = {
  projectId: string;
};

export default ({ projectId }: Params) => {
  const [projectAlias, setProjectAlias] = useState<string | undefined>();
  const [currentTeam] = useLocalState(s => s.currentTeam);

  const teamId = currentTeam?.id;

  const { data } = useProjectQuery({
    variables: { teamId: teamId ?? "" },
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
            publicTitle: rawProject.publicTitle,
            publicDescription: rawProject.publicDescription,
            isArchived: rawProject.isArchived,
            isBasicAuthActive: rawProject.isBasicAuthActive,
            basicAuthUsername: rawProject.basicAuthUsername,
            basicAuthPassword: rawProject.basicAuthPassword,
            imageUrl: rawProject.imageUrl,
            alias: rawProject.alias,
            publishmentStatus: rawProject.publishmentStatus,
          }
        : undefined,
    [rawProject],
  );

  // Project Updating
  const [updateProjectBasicAuthMutation] = useUpdateProjectBasicAuthMutation();
  const [updateProjectNameMutation] = useUpdateProjectNameMutation();
  const [updateProjectDescriptionMutation] = useUpdateProjectDescriptionMutation();
  const [updateProjectImageUrlMutation] = useUpdateProjectImageUrlMutation();
  const [archiveProjectMutation] = useArchiveProjectMutation();
  const [deleteProjectMutation] = useDeleteProjectMutation({
    refetchQueries: ["Me"],
  });

  const updateProjectName = useCallback(
    (name: string) => {
      projectId && updateProjectNameMutation({ variables: { projectId, name } });
    },
    [projectId, updateProjectNameMutation],
  );

  const deleteProject = useCallback(() => {
    projectId && deleteProjectMutation({ variables: { projectId } });
  }, [projectId, deleteProjectMutation]);

  const updateProjectBasicAuth = useCallback(
    (isBasicAuthActive?: boolean, basicAuthUsername?: string, basicAuthPassword?: string) => {
      projectId &&
        updateProjectBasicAuthMutation({
          variables: { projectId, isBasicAuthActive, basicAuthUsername, basicAuthPassword },
        });
    },
    [projectId, updateProjectBasicAuthMutation],
  );

  const updateProjectDescription = useCallback(
    (description: string) => {
      projectId && updateProjectDescriptionMutation({ variables: { projectId, description } });
    },
    [projectId, updateProjectDescriptionMutation],
  );

  const updateProjectImageUrl = useCallback(
    (imageUrl: string | null) => {
      projectId && updateProjectImageUrlMutation({ variables: { projectId, imageUrl } });
    },
    [projectId, updateProjectImageUrlMutation],
  );

  const archiveProject = useCallback(
    (archived: boolean) => {
      projectId && archiveProjectMutation({ variables: { projectId, archived } });
    },
    [projectId, archiveProjectMutation],
  );

  // Publication
  const [publishProjectMutation, { loading: loading }] = usePublishProjectMutation();

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

  const [validAlias, setValidAlias] = useState(false);
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
    setValidAlias(
      !validatingAlias &&
        !!project &&
        !!checkProjectAliasData &&
        (project.alias === checkProjectAliasData.checkProjectAlias.alias ||
          checkProjectAliasData.checkProjectAlias.available),
    );
  }, [validatingAlias, checkProjectAliasData, project]);

  useEffect(() => {
    if (!project) return;
    setProjectAlias(project?.alias);
  }, [project]);

  const [createAssetMutation] = useCreateAssetMutation();
  const createAssets = useCallback(
    (files: FileList) =>
      (async () => {
        if (teamId) {
          await Promise.all(
            Array.from(files).map(file =>
              createAssetMutation({ variables: { teamId, file }, refetchQueries: ["Assets"] }),
            ),
          );
        }
      })(),
    [createAssetMutation, teamId],
  );

  const { data: assetsData } = useAssetsQuery({
    variables: { teamId: teamId ?? "" },
    skip: !teamId,
  });
  const assets = assetsData?.assets.nodes.filter(Boolean) as AssetNodes;

  return {
    project,
    projectId,
    currentTeam,
    updateProjectBasicAuth,
    updateProjectName,
    updateProjectDescription,
    updateProjectImageUrl,
    archiveProject,
    deleteProject,
    projectAlias,
    projectStatus: convertStatus(project?.publishmentStatus),
    publishProject,
    loading,
    validAlias,
    checkProjectAlias,
    validatingAlias,
    createAssets,
    assets,
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
