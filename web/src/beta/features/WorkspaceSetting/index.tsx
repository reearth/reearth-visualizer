import { FC } from "react";

import useHook from "./hooks";
import Workspace from "./innerPages/Workspaces/Workspaces";

type Props = {
  tab: string;
  workspaceId?: string;
};

const WorkspaceSetting: FC<Props> = ({ tab, workspaceId }) => {
  const {
    projectsCount,
    // handleFetchWorkspace,
    handleFetchWorkspaces,
    // handleCreateWorkspace,
    handleUpdateWorkspace,
    handleDeleteWorkspace
    // handleAddMemberToWorkspace,
    // handleRemoveMemberFromWorkspace
  } = useHook({ workspaceId });
  return (
    <>
      {tab === "workspaces" && (
        <Workspace
          handleFetchWorkspaces={handleFetchWorkspaces}
          handleUpdateWorkspace={handleUpdateWorkspace}
          handleDeleteWorkspace={handleDeleteWorkspace}
          projectsCount={projectsCount}
        />
      )}
    </>
  );
};

export default WorkspaceSetting;
