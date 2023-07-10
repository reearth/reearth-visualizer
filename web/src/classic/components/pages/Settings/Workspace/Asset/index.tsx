import React from "react";
import { useParams } from "react-router-dom";

import Asset from "@reearth/classic/components/organisms/Settings/Workspace/Asset";
import { AuthenticationRequiredPage, withAuthorisation } from "@reearth/services/auth";

export type Props = {
  path?: string;
};

const AssetPage: React.FC<Props> = () => {
  const { workspaceId = "" } = useParams();
  return (
    <AuthenticationRequiredPage>
      <Asset workspaceId={workspaceId} />
    </AuthenticationRequiredPage>
  );
};

export default withAuthorisation()(AssetPage);
