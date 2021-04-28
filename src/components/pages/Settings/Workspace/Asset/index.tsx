import React from "react";

import Asset from "@reearth/components/organisms/Settings/Workspace/Asset";
import AuthenticationRequiredPage from "@reearth/components/pages/Common/AuthenticationRequiredPage";

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
