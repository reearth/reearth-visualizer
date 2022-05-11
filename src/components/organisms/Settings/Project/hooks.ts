import { useCallback, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import {
  useGetProjectsQuery,
  useUpdateProjectMutation,
  useArchiveProjectMutation,
  useDeleteProjectMutation,
} from "@reearth/gql";
import { useTeam, useNotification } from "@reearth/state";

type Params = {
  projectId: string;
};

export default ({ projectId }: Params) => {
  const intl = useIntl();
  const [, setNotification] = useNotification();
  const [currentTeam] = useTeam();

  const teamId = currentTeam?.id;

  const { data } = useGetProjectsQuery({
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

  const [updateProjectMutation] = useUpdateProjectMutation();
  const [archiveProjectMutation] = useArchiveProjectMutation();
  const [deleteProjectMutation] = useDeleteProjectMutation({
    refetchQueries: ["GetProjects"],
  });

  const updateProjectName = useCallback(
    (name?: string) => {
      if (!projectId || !name) return;
      updateProjectMutation({ variables: { projectId, name } });
    },
    [projectId, updateProjectMutation],
  );

  const updateProjectDescription = useCallback(
    (description?: string) => {
      if (!projectId || !description) return;
      updateProjectMutation({ variables: { projectId, description } });
    },
    [projectId, updateProjectMutation],
  );

  const updateProjectImageUrl = useCallback(
    (imageUrl?: string) => {
      if (!projectId) return;
      if (!imageUrl) {
        updateProjectMutation({ variables: { projectId, deleteImageUrl: true } });
      } else {
        updateProjectMutation({ variables: { projectId, imageUrl } });
      }
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
    project,
    projectId,
    currentTeam,
    updateProjectName,
    updateProjectDescription,
    updateProjectImageUrl,
    archiveProject,
    deleteProject,
    assetModalOpened,
    toggleAssetModal,
  };
};
