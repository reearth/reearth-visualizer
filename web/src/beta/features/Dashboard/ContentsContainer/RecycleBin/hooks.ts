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
    () =>
      (deletedProjects ?? []).map<DeletedProject | undefined>((project) => {
        if (!project) return undefined;
        return {
          id: project.id,
          name: project.name,
          imageUrl: project.imageUrl,
          isDeleted: project.isDeleted
        };
      }),
    [deletedProjects]
  );

  const isLoading = useMemo(() => loading, [loading]);

  const handleProjectRecovery = useCallback(
    async (project?: DeletedProject) => {
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
      setDisabled(!disabled);
      await useDeleteProject({ projectId });
      client.cache.evict({
        id: client.cache.identify({
          __typename: "Project",
          id: projectId
        })
      });
      client.cache.gc();
    },
    [client.cache, disabled, useDeleteProject]
  );
  return {
    filteredDeletedProjects,
    isLoading,
    disabled,
    handleProjectDelete,
    handleProjectRecovery
  };
};
