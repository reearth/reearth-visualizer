import { useCallback, useMemo, useState } from "react";

import {
  useGetProjectQuery,
  useUpdateProjectMutation,
  useArchiveProjectMutation,
  useDeleteProjectMutation,
} from "@reearth/gql";
import { useT } from "@reearth/i18n";
import { useWorkspace, useNotification } from "@reearth/state";

type Params = {
  projectId: string;
};

export default ({ projectId }: Params) => {
  const t = useT();
  const [, setNotification] = useNotification();
  const [currentWorkspace] = useWorkspace();

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
            publicTitle: data.node.publicTitle,
            publicDescription: data.node.publicDescription,
            isArchived: data.node.isArchived,
            isBasicAuthActive: data.node.isBasicAuthActive,
            basicAuthUsername: data.node.basicAuthUsername,
            basicAuthPassword: data.node.basicAuthPassword,
            imageUrl: data.node.imageUrl,
            alias: data.node.alias,
            publishmentStatus: data.node.publishmentStatus,
          }
        : undefined,
    [data?.node],
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
          text: archived ? t("Failed to archive project.") : t("Failed to unarchive project."),
        });
      } else {
        setNotification({
          type: "info",
          text: archived
            ? t("Successfully archived the project.")
            : t("Successfully unarchived the project. You can now edit this project."),
        });
      }
    },
    [projectId, t, setNotification, archiveProjectMutation],
  );

  const deleteProject = useCallback(async () => {
    if (!projectId) return;
    const results = await deleteProjectMutation({ variables: { projectId } });
    if (results.errors) {
      setNotification({
        type: "error",
        text: t("Failed to delete project."),
      });
    } else {
      setNotification({
        type: "info",
        text: t("Project was successfully deleted."),
      });
    }
  }, [projectId, t, setNotification, deleteProjectMutation]);

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
    currentWorkspace,
    updateProjectName,
    updateProjectDescription,
    updateProjectImageUrl,
    archiveProject,
    deleteProject,
    assetModalOpened,
    toggleAssetModal,
  };
};
