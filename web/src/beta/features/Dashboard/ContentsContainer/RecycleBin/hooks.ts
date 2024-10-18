import { useProjectFetcher } from "@reearth/services/api";
import { useCallback, useEffect, useState } from "react";

import { DeletedProject } from "../../type";

export default (workspaceId?: string) => {
  const {
    useDeletedProjectsQuery,
    useUpdateProjectRecycleBin,
    useDeleteProject
  } = useProjectFetcher();

  const { deletedProjects: projects } = useDeletedProjectsQuery(workspaceId);
const [deletedProjects, setDeletedProjects] = useState<DeletedProject[]>([]);

useEffect(() => {
  const mappedProjects = (projects ?? [])
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
  setDeletedProjects(mappedProjects);
}, [projects]);

  const handleProjectRecovery = useCallback(
    async (project?: DeletedProject) => {
      if (!project) return;
      const updatedProject = {
        projectId: project.id,
        deleted: !project.isDeleted
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

  return {
    deletedProjects,
    handleProjectDelete,
    handleProjectRecovery
  };
};
