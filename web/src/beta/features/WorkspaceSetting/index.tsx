import useAccountSettingsTabs from "@reearth/beta/hooks/useAccountSettingsTabs";
import SettingBase from "@reearth/beta/ui/components/SettingBase";
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

  const { tabs } = useAccountSettingsTabs({ workspaceId: workspaceId ?? "" });

  return (
    <SettingBase tabs={tabs} tab={tab} workspaceId={workspaceId}>
      {tab === "workspace" && (
        <Workspace
          handleFetchWorkspaces={handleFetchWorkspaces}
          handleUpdateWorkspace={handleUpdateWorkspace}
          handleDeleteWorkspace={handleDeleteWorkspace}
          projectsCount={filtedProjects?.length}
        />
      )}
    </SettingBase>
  );
};

export default WorkspaceSetting;
