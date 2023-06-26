import React from "react";
import { useParams } from "react-router-dom";

import Dataset from "@reearth/classic/components/organisms/Settings/Project/Dataset";
import { AuthenticationRequiredPage, withAuthorisation } from "@reearth/services/auth";

export type Props = {
  path?: string;
};

const DatasetPage: React.FC<Props> = () => {
  const { projectId = "" } = useParams();
  return (
    <AuthenticationRequiredPage>
      <Dataset projectId={projectId} />
    </AuthenticationRequiredPage>
  );
};

const withAuthenticationFun = withAuthorisation();

export default withAuthenticationFun(DatasetPage);
