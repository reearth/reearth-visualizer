import React from "react";
import { useParams } from "react-router-dom";

import { AuthenticationRequiredPage } from "@reearth/auth";
import Dashboard from "@reearth/components/organisms/Dashboard";

export type Props = {
  path?: string;
};

const DashboardPage: React.FC<Props> = () => {
  const { teamId } = useParams();
  return (
    <AuthenticationRequiredPage>
      <Dashboard teamId={teamId} />
    </AuthenticationRequiredPage>
  );
};

export default DashboardPage;
