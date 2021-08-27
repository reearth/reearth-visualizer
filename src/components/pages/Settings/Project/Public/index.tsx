import React from "react";

import { AuthenticationRequiredPage } from "@reearth/auth";
import Public from "@reearth/components/organisms/Settings/Project/Public";

export type Props = {
  path?: string;
  projectId?: string;
};

const PublicPage: React.FC<Props> = ({ projectId = "" }) => (
  <AuthenticationRequiredPage>
    <Public projectId={projectId} />
  </AuthenticationRequiredPage>
);

export default PublicPage;
