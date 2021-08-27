import React from "react";

import { AuthenticationRequiredPage } from "@reearth/auth";
import Asset from "@reearth/components/organisms/Settings/Workspace/Asset";

export type Props = {
  path?: string;
  teamId?: string;
};

const AssetPage: React.FC<Props> = ({ teamId = "" }) => (
  <AuthenticationRequiredPage>
    <Asset teamId={teamId} />
  </AuthenticationRequiredPage>
);

export default AssetPage;
