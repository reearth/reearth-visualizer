import { useApolloClient } from "@apollo/client/react";
import useLoadMore from "@reearth/app/hooks/useLoadMore";
import {
  useDeletedProjects,
  useProjectMutations
} from "@reearth/services/api/project";
import { useCallback, useMemo, useRef, useState } from "react";

import { DeletedProject } from "../../type";

const DELETED_PROJECTS_PER_PAGE = 16;

export default (workspaceId?: string) => {
  const { updateProjectRecycleBin, deleteProject } = useProjectMutations();
  const {
    deletedProjects,
    hasMoreDeletedProjects,
    loading,
    endCursor: deletedEndCursor,
    fetchMore: fetchMoreDeleted
  } = useDeletedProjects({
    workspaceId: workspaceId || "",
    pagination: { first: DELETED_PROJECTS_PER_PAGE }
  });

  const client = useApolloClient();

  // True while a recycle-bin operation (recover / permanent delete) is running.
  // Deliberately a single flag rather than per-item: both actions are destructive
  // and mutate the same list, so no second one should start while one is in flight.
  const [disabled, setDisabled] = useState(false);
  const isMutating = useRef(false);

  const filteredDeletedProjects = useMemo<DeletedProject[]>(
    () =>
      (deletedProjects ?? []).flatMap((project) =>
        project
          ? [
              {
                id: project.id,
                name: project.name,
                imageUrl: project.imageUrl,
                isDeleted: project.isDeleted,
                visibility: project.visibility,
                starred: project.starred,
                updatedAt: new Date(project.updatedAt)
              }
            ]
          : []
      ),
    [deletedProjects]
  );

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
      if (!project || isMutating.current) return false;
      isMutating.current = true;
      setDisabled(true);

      try {
        const result = await updateProjectRecycleBin({
          projectId: project.id,
          deleted: false
        });
        return result.status === "success";
      } catch (error) {
        console.error("Failed to recover project:", error);
        return false;
      } finally {
        isMutating.current = false;
        setDisabled(false);
      }
    },
    [updateProjectRecycleBin]
  );

  const handleProjectDelete = useCallback(
    async (projectId: string) => {
      if (!projectId || isMutating.current) return false;
      isMutating.current = true;
      setDisabled(true);

      try {
        const result = await deleteProject({ projectId });
        // deleteProject resolves with { status: "error" } when the server answers
        // with a null payload, so failure has to be checked explicitly. Evicting
        // on a failed delete would make the project disappear from the bin while
        // it still exists on the server.
        if (result.status !== "success") return false;

        client.cache.evict({
          id: client.cache.identify({
            __typename: "Project",
            id: projectId
          })
        });
        client.cache.gc();
        return true;
      } catch (error) {
        console.error("Failed to delete project:", error);
        return false;
      } finally {
        isMutating.current = false;
        setDisabled(false);
      }
    },
    [client, deleteProject]
  );

  return {
    filteredDeletedProjects,
    isLoading: loading,
    disabled,
    wrapperRef,
    contentRef,
    handleProjectDelete,
    handleProjectRecovery
  };
};
