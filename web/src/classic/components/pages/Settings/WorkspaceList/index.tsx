import React from "react";
import { useParams } from "react-router-dom";

import OrganismsWorkspaceList from "@reearth/classic/components/organisms/Settings/WorkspaceList";
import { AuthenticatedPage } from "@reearth/services/auth";

export type Props = {
  path?: string;
};

const WorkspaceList: React.FC<Props> = () => {
  const { workspaceId = "" } = useParams();
  return (
    <AuthenticatedPage>
      <OrganismsWorkspaceList workspaceId={workspaceId} />
    </AuthenticatedPage>
  );
};

export default WorkspaceList;
