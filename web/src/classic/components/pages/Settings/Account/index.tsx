import React from "react";

import Account from "@reearth/classic/components/organisms/Settings/Account";
import { AuthenticationRequiredPage } from "@reearth/services/auth";

export type Props = {
  path?: string;
};

const AccountPage: React.FC<Props> = () => (
  <AuthenticationRequiredPage>
    <Account />
  </AuthenticationRequiredPage>
);

export default AccountPage;
