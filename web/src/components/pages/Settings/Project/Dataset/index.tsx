import React from "react";
import { useParams } from "react-router-dom";

import { AuthenticationRequiredPage } from "@reearth/auth";
import Dataset from "@reearth/components/organisms/Settings/Project/Dataset";

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

export default DatasetPage;
