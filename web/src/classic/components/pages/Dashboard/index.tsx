import React from "react";
import { useParams } from "react-router-dom";

import { AuthenticationRequiredPage } from "@reearth/beta/services/auth";
import Dashboard from "@reearth/classic/components/organisms/Dashboard";

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

export default DashboardPage;
