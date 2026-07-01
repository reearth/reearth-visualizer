import { useApolloClient } from "@apollo/client/react";
import useLoadMore from "@reearth/app/hooks/useLoadMore";
import {
  useDeletedProjects,
  useProjectMutations
} from "@reearth/services/api/project";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DeletedProject } from "../../type";

const DELETED_PROJECTS_PER_PAGE = 16;

export default (workspaceId?: string) => {
  const { updateProjectRecycleBin, deleteProject } = useProjectMutations();
  const {
    deletedProjects,
    hasMoreDeletedProjects,
    loading,
    refetch,
    endCursor: deletedEndCursor,
    fetchMore: fetchMoreDeleted
  } = useDeletedProjects({
    workspaceId: workspaceId || "",
    pagination: { first: DELETED_PROJECTS_PER_PAGE }
  });
  
  const [disabled, setDisabled] = useState(false);
  const client = useApolloClient();

  const filteredDeletedProjects = useMemo(
    () => (deletedProjects ?? []).filter(Boolean),
    [deletedProjects]
  );

  const isLoading = useMemo(() => loading, [loading]);

  const isFetchingMore = useRef(false);

  const handleGetMoreDeletedProjects = useCallback(async () => {
    if (isFetchingMore.current) return;
    if (hasMoreDeletedProjects) {
      isFetchingMore.current = true;
      try {
        await fetchMoreDeleted({
          variables: {
            pagination: {
              after: deletedEndCursor,
              first: DELETED_PROJECTS_PER_PAGE
            }
          }
        });
      } catch (_err) {
        console.error("Failed to fetch more deleted projects:", _err);
      } finally {
        isFetchingMore.current = false;
      }
    }
  }, [hasMoreDeletedProjects, fetchMoreDeleted, deletedEndCursor]);

  const { wrapperRef, contentRef } = useLoadMore({
    data: filteredDeletedProjects,
    onLoadMore: handleGetMoreDeletedProjects
  });

  const handleProjectRecovery = useCallback(
    async (project?: DeletedProject | null) => {
      if (!project) return;
      const updatedProject = {
        projectId: project.id,
        deleted: false
      };

      await updateProjectRecycleBin(updatedProject);
    },

    [updateProjectRecycleBin]
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleProjectDelete = useCallback(
    async (projectId: string) => {
      if (!projectId) return;
      setDisabled(true);

      try {
        await deleteProject({ projectId });
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
    [client, deleteProject]
  );
  return {
    filteredDeletedProjects,
    isLoading,
    disabled,
    wrapperRef,
    contentRef,
    handleProjectDelete,
    handleProjectRecovery
  };
};
