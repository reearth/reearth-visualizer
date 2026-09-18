import { useProjectMutations } from "@reearth/services/api/project";
import { Visualizer } from "@reearth/services/gql";
import { useCreateProjectModal, useWorkspace } from "@reearth/services/state";
import { FC, useCallback } from "react";

import ProjectCreatorModal from "./ProjectCreatorModal";
import { Project } from "../Dashboard/type";

const CreateProjectModal: FC = () => {
  const [, setCreateProjectModal] = useCreateProjectModal();
  const [currentWorkspace] = useWorkspace();
  const { createProject } = useProjectMutations();

  const handleClose = useCallback(() => {
    setCreateProjectModal(false);
  }, [setCreateProjectModal]);

  const handleProjectCreate = useCallback(
    async (
      data: Pick<
        Project,
        "name" | "description" | "projectAlias" | "visibility"
      > & { license?: string }
    ) => {
      if (!currentWorkspace?.id) return false;
      const { status } = await createProject(
        currentWorkspace.id,
        Visualizer.Cesium,
        data.name,
        true,
        data.projectAlias,
        data.visibility,
        data.description,
        data.license
      );
      // The modal closes itself via onClose once this resolves true, so a
      // failed creation keeps the form and what the user typed.
      return status === "success";
    },
    [createProject, currentWorkspace?.id]
  );

  return (
    <ProjectCreatorModal
      onClose={handleClose}
      onProjectCreate={handleProjectCreate}
    />
  );
};

export default CreateProjectModal;
