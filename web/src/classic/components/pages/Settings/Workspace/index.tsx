import React from "react";
import { useParams } from "react-router-dom";

import { AuthenticationRequiredPage } from "@reearth/beta/services/auth";
import Workspace from "@reearth/classic/components/organisms/Settings/Workspace";

export type Props = {
  path?: string;
};

const WorkspacePage: React.FC<Props> = () => {
  const { workspaceId = "" } = useParams();
  return (
    <AuthenticationRequiredPage>
      <Workspace workspaceId={workspaceId} />
    </AuthenticationRequiredPage>
  );
};

export default WorkspacePage;
