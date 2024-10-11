import WorkspaceSetting from "@reearth/beta/features/WorkspaceSetting";
import AccountSettingBase from "@reearth/beta/ui/components/AccountSettingBase";
import { FC } from "react";
import { useLocation, useParams } from "react-router-dom";

import Page from "../Page";

const WorkspaceSettingPage: FC = () => {
  const { pathname } = useLocation();
  const tab = pathname.includes("members") ? "members" : "workspaces";

  const { workspaceId } = useParams();

  return (
    <Page
      renderItem={(props) => (
        <AccountSettingBase {...props} tab={tab} workspaceId={workspaceId}>
          <WorkspaceSetting tab={tab} workspaceId={workspaceId} />
        </AccountSettingBase>
      )}
    />
  );
};

export default WorkspaceSettingPage;
