import React from "react";
import { useParams } from "react-router-dom";

import Dashboard from "@reearth/classic/components/organisms/Dashboard";
import { AuthenticationRequiredPage, withAuthorisation } from "@reearth/services/auth";

export type Props = {
  path?: string;
};

const DashboardPage: React.FC<Props> = () => {
  const { workspaceId } = useParams();
  return (
    <AuthenticationRequiredPage>
      <Dashboard workspaceId={workspaceId} />
    </AuthenticationRequiredPage>
  );
};

const withAuthenticationFun = withAuthorisation();

export default withAuthenticationFun(DashboardPage);
