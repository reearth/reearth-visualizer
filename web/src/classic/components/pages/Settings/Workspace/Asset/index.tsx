import React from "react";
import { useParams } from "react-router-dom";

import Asset from "@reearth/classic/components/organisms/Settings/Workspace/Asset";
import { AuthenticatedPage } from "@reearth/services/auth";

export type Props = {
  path?: string;
};

const AssetPage: React.FC<Props> = () => {
  const { workspaceId = "" } = useParams();
  return (
    <AuthenticatedPage>
      <Asset workspaceId={workspaceId} />
    </AuthenticatedPage>
  );
};

export default AssetPage;
