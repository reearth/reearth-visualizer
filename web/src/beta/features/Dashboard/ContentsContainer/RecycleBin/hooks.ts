import { useProjectFetcher } from "@reearth/services/api";
import { useCallback, useEffect, useMemo, useState } from "react";

import { DeletedProject } from "../../type";

export default (workspaceId?: string) => {
  const {
    useDeletedProjectsQuery,
    useUpdateProjectRecycleBin,
    useDeleteProject
  } = useProjectFetcher();
  const { deletedProjects, loading } = useDeletedProjectsQuery(workspaceId);
  const [filteredDeletedProjects, setFilteredDeletedProjects] = useState<
    DeletedProject[]
  >([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    const mappedProjects = (deletedProjects ?? [])
      .map<DeletedProject | undefined>((project) => {
        if (!project) return undefined;
        return {
          id: project.id,
          name: project.name,
          imageUrl: project.imageUrl,
          isDeleted: project.isDeleted
        };
      })
      .filter(Boolean) as DeletedProject[];
    setFilteredDeletedProjects(mappedProjects);
  }, [deletedProjects]);

  const isLoading = useMemo(() => loading, [loading]);

  const handleProjectRecovery = useCallback(
    async (project?: DeletedProject) => {
      if (!project) return;
      const updatedProject = {
        projectId: project.id,
        deleted: false
      };

      await useUpdateProjectRecycleBin(updatedProject);
    },

    [useUpdateProjectRecycleBin]
  );

  const handleProjectDelete = useCallback(
    async (project?: DeletedProject) => {
      if (!project) return;
      await useDeleteProject({ projectId: project.id });
    },
    [useDeleteProject]
  );

  const handleDeleteModalClose = useCallback((value: boolean) => {
    setDeleteModalVisible(value);
  }, []);

  return {
    filteredDeletedProjects,
    isLoading,
    deleteModalVisible,
    handleDeleteModalClose,
    handleProjectDelete,
    handleProjectRecovery
  };
};
