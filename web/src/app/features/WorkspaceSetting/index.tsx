import CursorStatus from "@reearth/app/features/CursorStatus";
import useAccountSettingsTabs from "@reearth/app/hooks/useAccountSettingsTabs";
import SettingBase from "@reearth/app/ui/components/SettingBase";
import { useWorkspace } from "@reearth/services/api/workspace";
import { FC } from "react";

import Workspace from "./innerPages/Workspaces";

type Props = {
  tab: string;
  workspaceId: string;
};

enum TABS {
  WORKSPACE = "workspace"
}

const WorkspaceSetting: FC<Props> = ({ tab, workspaceId }) => {
  const { workspace } = useWorkspace(workspaceId);

  const { tabs } = useAccountSettingsTabs({ workspaceId: workspaceId ?? "" });

  return (
    <>
      <SettingBase tabs={tabs} tab={tab} workspaceId={workspaceId}>
        {tab === TABS.WORKSPACE && <Workspace workspace={workspace} />}
      </SettingBase>
      <CursorStatus />
    </>
  );
};

export default WorkspaceSetting;
