import React from "react";

import { AuthenticationRequiredPage } from "@reearth/auth";
import Dashboard from "@reearth/components/organisms/Dashboard";

export type Props = {
  path?: string;
  teamId?: string;
};

const DashboardPage: React.FC<Props> = ({ teamId }) => {
  return (
    <AuthenticationRequiredPage>
      <Dashboard teamId={teamId} />
    </AuthenticationRequiredPage>
  );
};

export default DashboardPage;
