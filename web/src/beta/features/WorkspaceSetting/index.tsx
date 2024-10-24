import useAccountSettingsTabs from "@reearth/beta/hooks/useAccountSettingsTabs";
import SettingBase from "@reearth/beta/ui/components/SettingBase";
import { FC } from "react";

import CursorStatus from "../CursorStatus";
import useProjectsHook from "../Dashboard/ContentsContainer/Projects/hooks";

import useWorkspaceHook from "./hooks";
import Members from "./innerPages/Members/Members";
import Workspace from "./innerPages/Workspaces/Workspaces";

type Props = {
  tab: string;
  workspaceId?: string;
};

enum TABS {
  WORKSPACE = "workspace",
  MEMBERS = "members"
}

const WorkspaceSetting: FC<Props> = ({ tab, workspaceId }) => {
  const {
    handleFetchWorkspaces,
    handleUpdateWorkspace,
    handleDeleteWorkspace,
    handleAddMemberToWorkspace,
    handleSearchUser,
    handleUpdateMemberOfWorkspace,
    handleRemoveMemberFromWorkspace
  } = useWorkspaceHook();

  const { filtedProjects } = useProjectsHook(workspaceId);

  const { tabs } = useAccountSettingsTabs({ workspaceId: workspaceId ?? "" });

  return (
    <SettingBase tabs={tabs} tab={tab} workspaceId={workspaceId}>
      {tab === TABS.WORKSPACE && (
        <Workspace
          handleFetchWorkspaces={handleFetchWorkspaces}
          handleUpdateWorkspace={handleUpdateWorkspace}
          handleDeleteWorkspace={handleDeleteWorkspace}
          projectsCount={filtedProjects?.length}
        />
      )}
      {tab === TABS.MEMBERS && (
        <Members
          handleSearchUser={handleSearchUser}
          handleAddMemberToWorkspace={handleAddMemberToWorkspace}
          handleUpdateMemberOfWorkspace={handleUpdateMemberOfWorkspace}
          handleRemoveMemberFromWorkspace={handleRemoveMemberFromWorkspace}
        />
      )}
      <CursorStatus />
    </SettingBase>
  );
};

export default WorkspaceSetting;
