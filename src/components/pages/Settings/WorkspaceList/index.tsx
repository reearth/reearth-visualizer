import React from "react";

import { AuthenticationRequiredPage } from "@reearth/auth";
import OrganismsWorkspaceList from "@reearth/components/organisms/Settings/WorkspaceList";

export type Props = {
  path?: string;
  teamId?: string;
};

const WorkspaceList: React.FC<Props> = ({ teamId = "" }) => (
  <AuthenticationRequiredPage>
    <OrganismsWorkspaceList teamId={teamId} />
  </AuthenticationRequiredPage>
);

export default WorkspaceList;
