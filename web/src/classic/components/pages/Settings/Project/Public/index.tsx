import React from "react";
import { useParams } from "react-router-dom";

import Public from "@reearth/classic/components/organisms/Settings/Project/Public";
import { AuthenticatedPage } from "@reearth/services/auth";

export type Props = {
  path?: string;
};

const PublicPage: React.FC<Props> = () => {
  const { projectId = "" } = useParams();
  return (
    <AuthenticatedPage>
      <Public projectId={projectId} />
    </AuthenticatedPage>
  );
};

export default PublicPage;
