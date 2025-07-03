import NotFound from "@reearth/app/features/NotFound";
import WorkspaceSetting from "@reearth/app/features/WorkspaceSetting";
import { config } from "@reearth/services/config";
import { FC, useMemo } from "react";
import { useParams } from "react-router-dom";

import Page from "../Page";

type WorkspaceSettingPageProps = {
  tab: "workspace" | "members";
};

const WorkspaceSettingPage: FC<WorkspaceSettingPageProps> = ({ tab }) => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const disabled = useMemo(() => config()?.saasMode, []);
  return (
    <Page
      workspaceId={workspaceId}
      renderItem={({ workspaceId }) =>
        disabled || !workspaceId ? (
          <NotFound />
        ) : (
          <WorkspaceSetting tab={tab} workspaceId={workspaceId} />
        )
      }
    />
  );
};

export default WorkspaceSettingPage;
