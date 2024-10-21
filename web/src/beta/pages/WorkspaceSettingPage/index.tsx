import WorkspaceSetting from "@reearth/beta/features/WorkspaceSetting";
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
      renderItem={({ workspaceId }) => (
        <WorkspaceSetting tab={tab} workspaceId={workspaceId} />
      )}
    />
  );
};

export default WorkspaceSettingPage;
