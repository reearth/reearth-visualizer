import React from "react";
import { useParams } from "react-router-dom";

import Public from "@reearth/classic/components/organisms/Settings/Project/Public";
import { AuthenticationRequiredPage, withAuthorisation } from "@reearth/services/auth";

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

export default withAuthorisation()(PublicPage);
