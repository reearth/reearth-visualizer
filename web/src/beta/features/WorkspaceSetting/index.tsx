import CursorStatus from "@reearth/beta/features/CursorStatus";
import useAccountSettingsTabs from "@reearth/beta/hooks/useAccountSettingsTabs";
import SettingBase from "@reearth/beta/ui/components/SettingBase";
import { useWorkspaceFetcher } from "@reearth/services/api";
import { FC } from "react";

import Members from "./innerPages/Members";
import Workspace from "./innerPages/Workspaces";

type Props = {
  tab: string;
  workspaceId: string;
};

enum TABS {
  WORKSPACE = "workspace",
  MEMBERS = "members"
}

const WorkspaceSetting: FC<Props> = ({ tab, workspaceId }) => {
  const { useWorkspaceQuery } = useWorkspaceFetcher();
  const { workspace } = useWorkspaceQuery(workspaceId);

  const { tabs } = useAccountSettingsTabs({ workspaceId: workspaceId ?? "" });

  return (
    <>
      <SettingBase tabs={tabs} tab={tab} workspaceId={workspaceId}>
        {tab === TABS.WORKSPACE && <Workspace workspace={workspace} />}
        {tab === TABS.MEMBERS && <Members workspace={workspace} />}
      </SettingBase>
      <CursorStatus />
    </>
  );
};

export default WorkspaceSetting;
