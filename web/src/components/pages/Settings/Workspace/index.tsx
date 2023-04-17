import React from "react";
import { useParams } from "react-router-dom";

import { AuthenticationRequiredPage } from "@reearth/auth";
import Workspace from "@reearth/components/organisms/Settings/Workspace";

export type Props = {
  path?: string;
};

const WorkspacePage: React.FC<Props> = () => {
  const { teamId = "" } = useParams();
  return (
    <AuthenticationRequiredPage>
      <Workspace teamId={teamId} />
    </AuthenticationRequiredPage>
  );
};

export default WorkspacePage;
