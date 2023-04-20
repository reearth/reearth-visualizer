import React from "react";
import { useParams } from "react-router-dom";

import { AuthenticationRequiredPage } from "@reearth/auth";
import OrganismsWorkspaceList from "@reearth/components/organisms/Settings/WorkspaceList";

export type Props = {
  path?: string;
};

const WorkspaceList: React.FC<Props> = () => {
  const { teamId = "" } = useParams();
  return (
    <AuthenticationRequiredPage>
      <OrganismsWorkspaceList teamId={teamId} />
    </AuthenticationRequiredPage>
  );
};

export default WorkspaceList;
