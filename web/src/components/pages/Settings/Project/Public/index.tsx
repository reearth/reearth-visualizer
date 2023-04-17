import React from "react";
import { useParams } from "react-router-dom";

import { AuthenticationRequiredPage } from "@reearth/auth";
import Public from "@reearth/components/organisms/Settings/Project/Public";

export type Props = {
  path?: string;
};

const PublicPage: React.FC<Props> = () => {
  const { projectId = "" } = useParams();
  return (
    <AuthenticationRequiredPage>
      <Public projectId={projectId} />
    </AuthenticationRequiredPage>
  );
};

export default PublicPage;
