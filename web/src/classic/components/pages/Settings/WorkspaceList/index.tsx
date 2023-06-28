import React from "react";
import { useParams } from "react-router-dom";

import OrganismsWorkspaceList from "@reearth/classic/components/organisms/Settings/WorkspaceList";
import { AuthenticationRequiredPage, withAuthorisation } from "@reearth/services/auth";

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

export default withAuthorisation()(WorkspaceList);
