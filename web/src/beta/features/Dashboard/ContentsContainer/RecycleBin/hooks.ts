import { useProjectFetcher } from "@reearth/services/api";
import { useCallback, useMemo } from "react";

import { DeletedProject } from "../../type";

export default (workspaceId?: string) => {
  const {
    useDeletedProjectsQuery,
    useUpdateProjectRecyleBin,
    useDeleteProject
  } = useProjectFetcher();

  const { deletedProjects: projects } = useDeletedProjectsQuery(workspaceId);

  const deletedProjects = useMemo(() => {
    return (projects ?? []).map<DeletedProject | undefined>((project) => {
      if (!project) return undefined;
      return {
        id: project.id,
        name: project.name,
        imageUrl: project.imageUrl,
        isDeleted: project.isDeleted
      };
    });
  }, [projects]);

  const handleProjectRecovery = useCallback(
    async (project?: DeletedProject) => {
      if (!project) return;
      const updatedProject = {
        projectId: project.id,
        deleted: false
      };

      await useUpdateProjectRecyleBin(updatedProject);
    },
    [useUpdateProjectRecyleBin]
  );

  const handleProjectDelete = useCallback(
    async (project?: DeletedProject) => {
      if (!project) return;
      await useDeleteProject({ projectId: project.id });
    },
    [useDeleteProject]
  );

  return {
    deletedProjects,
    handleProjectDelete,
    handleProjectRecovery
  };
};
