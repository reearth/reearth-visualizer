import React from "react";

import AuthenticationRequiredPage from "@reearth/components/pages/Common/AuthenticationRequiredPage";
import OrganismsWorkspaceList from "@reearth/components/organisms/Settings/WorkspaceList";

export interface Props {
  path?: string;
  teamId?: string;
}

const WorkspaceList: React.FC<Props> = ({ teamId = "" }) => (
  <AuthenticationRequiredPage>
    <OrganismsWorkspaceList teamId={teamId} />
  </AuthenticationRequiredPage>
);

export default WorkspaceList;
