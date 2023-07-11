import React from "react";
import { useParams } from "react-router-dom";

import Dataset from "@reearth/classic/components/organisms/Settings/Project/Dataset";
import { AuthenticatedPage } from "@reearth/services/auth";

export type Props = {
  path?: string;
};

const DatasetPage: React.FC<Props> = () => {
  const { projectId = "" } = useParams();
  return (
    <AuthenticatedPage>
      <Dataset projectId={projectId} />
    </AuthenticatedPage>
  );
};

export default DatasetPage;
