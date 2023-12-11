import React from "react";
import { useParams } from "react-router-dom";

import Workspace from "@reearth/classic/components/organisms/Settings/Workspace";
import { AuthenticatedPage } from "@reearth/services/auth";

export type Props = {
  path?: string;
};

const WorkspacePage: React.FC<Props> = () => {
  const { workspaceId = "" } = useParams();
  return (
    <AuthenticatedPage>
      <Workspace workspaceId={workspaceId} />
    </AuthenticatedPage>
  );
};

export default WorkspacePage;
