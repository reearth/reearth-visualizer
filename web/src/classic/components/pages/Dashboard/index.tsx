import React from "react";
import { useParams } from "react-router-dom";

import Dashboard from "@reearth/classic/components/organisms/Dashboard";
import { AuthenticatedPage } from "@reearth/services/auth";

export type Props = {
  path?: string;
};

const DashboardPage: React.FC<Props> = () => {
  const { workspaceId } = useParams();
  return (
    <AuthenticatedPage>
      <Dashboard workspaceId={workspaceId} />
    </AuthenticatedPage>
  );
};

export default DashboardPage;
