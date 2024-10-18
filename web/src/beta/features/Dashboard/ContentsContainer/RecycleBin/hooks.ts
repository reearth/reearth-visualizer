import { useProjectFetcher } from "@reearth/services/api";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { useCallback, useEffect, useState } from "react";

import { DeletedProject } from "../../type";

export default (workspaceId?: string) => {
  const {
    useDeletedProjectsQuery,
    useUpdateProjectRecycleBin,
    useDeleteProject
  } = useProjectFetcher();
  const t = useT();
  const { deletedProjects } = useDeletedProjectsQuery(workspaceId);
  const [filteredDeletedProjects, setFilteredDeletedProjects] = useState<
    DeletedProject[]
  >([]);
  const [, setNotification] = useNotification();

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

  const handleProjectRecovery = useCallback(
    async (project?: DeletedProject) => {
      if (!project) return;
      const updatedProject = {
        projectId: project.id,
        deleted: !project.isDeleted
      };

      const { status } = await useUpdateProjectRecycleBin(updatedProject);
      if (status === "success") {
        setNotification({
          type: "success",
          text: t("Successfully recover the project!")
        });
      } else {
        setNotification({
          type: "error",
          text: t("Failed to recover the project.")
        });
      }
    },
    [setNotification, t, useUpdateProjectRecycleBin]
  );

  const handleProjectDelete = useCallback(
    async (project?: DeletedProject) => {
      if (!project) return;
      await useDeleteProject({ projectId: project.id });
    },
    [useDeleteProject]
  );

  return {
    filteredDeletedProjects,
    handleProjectDelete,
    handleProjectRecovery
  };
};
