import React from "react";

import Account from "@reearth/beta/organisms/Settings/Account";
import { AuthenticatedPage } from "@reearth/services/auth";

export type Props = {
  path?: string;
};

const AccountPage: React.FC<Props> = () => (
  <AuthenticatedPage>
    <Account />
  </AuthenticatedPage>
);

export default AccountPage;
