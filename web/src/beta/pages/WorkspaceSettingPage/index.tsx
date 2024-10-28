import NotFound from "@reearth/beta/features/NotFound";
import WorkspaceSetting from "@reearth/beta/features/WorkspaceSetting";
import { config } from "@reearth/services/config";
import { FC } from "react";
import { useParams } from "react-router-dom";

import Page from "../Page";

type WorkspaceSettingPageProps = {
  tab: "workspace" | "members";
};

const WorkspaceSettingPage: FC<WorkspaceSettingPageProps> = ({ tab }) => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  return (
    <Page
      workspaceId={workspaceId}
      renderItem={({ workspaceId }) =>
        config()?.disableWorkspaceManagement ? (
          <NotFound />
        ) : (
          <WorkspaceSetting tab={tab} workspaceId={workspaceId} />
        )
      }
    />
  );
};

export default WorkspaceSettingPage;
