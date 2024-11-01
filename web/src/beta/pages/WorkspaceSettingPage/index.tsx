import NotFound from "@reearth/beta/features/NotFound";
import WorkspaceSetting from "@reearth/beta/features/WorkspaceSetting";
import { config } from "@reearth/services/config";
import { FC, useMemo } from "react";
import { useParams } from "react-router-dom";

import Page from "../Page";

type WorkspaceSettingPageProps = {
  tab: "workspace" | "members";
};

const WorkspaceSettingPage: FC<WorkspaceSettingPageProps> = ({ tab }) => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const disabled = useMemo(() => config()?.disableWorkspaceManagement, []);
  return (
    <Page
      workspaceId={workspaceId}
      renderItem={({ workspaceId }) =>
        disabled ? (
          <NotFound />
        ) : (
          <WorkspaceSetting tab={tab} workspaceId={workspaceId} />
        )
      }
    />
  );
};

export default WorkspaceSettingPage;
