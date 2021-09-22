import { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

import {
  useProjectQuery,
  useUpdateProjectMutation,
  useArchiveProjectMutation,
  useDeleteProjectMutation,
  useCreateAssetMutation,
  AssetsQuery,
  useAssetsQuery,
} from "@reearth/gql";
import { useTeam, useNotification } from "@reearth/state";

export type AssetNodes = NonNullable<AssetsQuery["assets"]["nodes"][number]>[];

type Params = {
  projectId: string;
};

export default ({ projectId }: Params) => {
  const intl = useIntl();
  const [, setNotification] = useNotification();
  const [currentTeam] = useTeam();

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
  const [updateProjectMutation] = useUpdateProjectMutation();
  const [archiveProjectMutation] = useArchiveProjectMutation();
  const [deleteProjectMutation] = useDeleteProjectMutation({
    refetchQueries: ["Me"],
  });

  const updateProjectName = useCallback(
    (name: string) => {
      projectId && updateProjectMutation({ variables: { projectId, name } });
    },
    [projectId, updateProjectMutation],
  );

  const updateProjectDescription = useCallback(
    (description: string) => {
      projectId && updateProjectMutation({ variables: { projectId, description } });
    },
    [projectId, updateProjectMutation],
  );

  const updateProjectImageUrl = useCallback(
    (imageUrl: string | null) => {
      projectId && updateProjectMutation({ variables: { projectId, imageUrl } });
    },
    [projectId, updateProjectMutation],
  );

  const archiveProject = useCallback(
    async (archived: boolean) => {
      if (!projectId) return;
      const results = await archiveProjectMutation({ variables: { projectId, archived } });
      if (results.errors) {
        setNotification({
          type: "error",
          text: archived
            ? intl.formatMessage({
                defaultMessage: "Failed to archive project.",
              })
            : intl.formatMessage({ defaultMessage: "Failed to unarchive project." }),
        });
      } else {
        setNotification({
          type: "info",
          text: archived
            ? intl.formatMessage({ defaultMessage: "Successfully archived the project." })
            : intl.formatMessage({
                defaultMessage:
                  "Successfully unarchived the project. You can now edit this project.",
              }),
        });
      }
    },
    [projectId, intl, setNotification, archiveProjectMutation],
  );

  const deleteProject = useCallback(async () => {
    if (!projectId) return;
    const results = await deleteProjectMutation({ variables: { projectId } });
    if (results.errors) {
      setNotification({
        type: "error",
        text: intl.formatMessage({ defaultMessage: "Failed to delete project." }),
      });
    } else {
      setNotification({
        type: "info",
        text: intl.formatMessage({ defaultMessage: "Project was successfully deleted." }),
      });
    }
  }, [projectId, intl, setNotification, deleteProjectMutation]);

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
    updateProjectName,
    updateProjectDescription,
    updateProjectImageUrl,
    archiveProject,
    deleteProject,
    createAssets,
    assets,
  };
};
