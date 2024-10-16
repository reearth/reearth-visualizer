import { FC } from "react";

import useProjectsHook from "../Dashboard/ContentsContainer/Projects/hooks";

import useWorkspaceHook from "./hooks";
import Workspace from "./innerPages/Workspaces/Workspaces";

type Props = {
  tab: string;
  workspaceId?: string;
};

const WorkspaceSetting: FC<Props> = ({ tab, workspaceId }) => {
  const {
    handleFetchWorkspaces,
    handleUpdateWorkspace,
    handleDeleteWorkspace
  } = useWorkspaceHook();

  const { filtedProjects } = useProjectsHook(workspaceId);
  return (
    <>
      {tab === "workspaces" && (
        <Workspace
          handleFetchWorkspaces={handleFetchWorkspaces}
          handleUpdateWorkspace={handleUpdateWorkspace}
          handleDeleteWorkspace={handleDeleteWorkspace}
          projectsCount={filtedProjects?.length}
        />
      )}
    </>
  );
};

export default WorkspaceSetting;
