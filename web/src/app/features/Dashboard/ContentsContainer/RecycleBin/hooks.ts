import { useApolloClient } from "@apollo/client";
import { useProjectFetcher } from "@reearth/services/api";
import { useCallback, useEffect, useMemo, useState } from "react";

import { DeletedProject } from "../../type";

export default (workspaceId?: string) => {
  const { useDeletedProjectsQuery, useUpdateProjectRemove, useDeleteProject } =
    useProjectFetcher();
  const { deletedProjects, loading, refetch } =
    useDeletedProjectsQuery(workspaceId);
  const [disabled, setDisabled] = useState(false);
  const client = useApolloClient();

  const filteredDeletedProjects = useMemo(
    () => (deletedProjects ?? []).filter(Boolean),
    [deletedProjects]
  );

  const isLoading = useMemo(() => loading, [loading]);

  const handleProjectRecovery = useCallback(
    async (project?: DeletedProject | null) => {
      if (!project) return;
      const updatedProject = {
        projectId: project.id,
        deleted: false
      };

      await useUpdateProjectRemove(updatedProject);
    },

    [useUpdateProjectRemove]
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleProjectDelete = useCallback(
    async (projectId: string) => {
      if (!projectId) return;
      setDisabled(true);

      try {
        await useDeleteProject({ projectId });
        client.cache.evict({
          id: client.cache.identify({
            __typename: "Project",
            id: projectId
          })
        });
        client.cache.gc();
      } catch (error) {
        console.error("Failed to delete project:", error);
      } finally {
        setDisabled(false);
      }
    },
    [client, useDeleteProject]
  );
  return {
    filteredDeletedProjects,
    isLoading,
    disabled,
    handleProjectDelete,
    handleProjectRecovery
  };
};
