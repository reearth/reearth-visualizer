import React from "react";
import { useParams } from "react-router-dom";

import { AuthenticationRequiredPage } from "@reearth/auth";
import OrganismsWorkspaceList from "@reearth/components/organisms/Settings/WorkspaceList";

export type Props = {
  path?: string;
};

const WorkspaceList: React.FC<Props> = () => {
  const { workspaceId = "" } = useParams();
  return (
    <AuthenticationRequiredPage>
      <OrganismsWorkspaceList workspaceId={workspaceId} />
    </AuthenticationRequiredPage>
  );
};

export default WorkspaceList;
