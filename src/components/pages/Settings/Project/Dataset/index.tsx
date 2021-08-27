import React from "react";

import { AuthenticationRequiredPage } from "@reearth/auth";
import Dataset from "@reearth/components/organisms/Settings/Project/Dataset";

export type Props = {
  path?: string;
  projectId?: string;
};

const DatasetPage: React.FC<Props> = ({ projectId = "" }) => (
  <AuthenticationRequiredPage>
    <Dataset projectId={projectId} />
  </AuthenticationRequiredPage>
);

export default DatasetPage;
