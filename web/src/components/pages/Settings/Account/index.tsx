import React from "react";

import { AuthenticationRequiredPage } from "@reearth/auth";
import Account from "@reearth/components/organisms/Settings/Account";

export type Props = {
  path?: string;
};

const AccountPage: React.FC<Props> = () => (
  <AuthenticationRequiredPage>
    <Account />
  </AuthenticationRequiredPage>
);

export default AccountPage;
