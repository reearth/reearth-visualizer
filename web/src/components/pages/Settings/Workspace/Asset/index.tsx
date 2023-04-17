import React from "react";
import { useParams } from "react-router-dom";

import { AuthenticationRequiredPage } from "@reearth/auth";
import Asset from "@reearth/components/organisms/Settings/Workspace/Asset";

export type Props = {
  path?: string;
};

const AssetPage: React.FC<Props> = () => {
  const { teamId = "" } = useParams();
  return (
    <AuthenticationRequiredPage>
      <Asset teamId={teamId} />
    </AuthenticationRequiredPage>
  );
};

export default AssetPage;
