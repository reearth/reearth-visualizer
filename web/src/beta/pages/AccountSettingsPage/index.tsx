import AccountAndWorkSpaceSetting from "@reearth/beta/features/AccountAndWorkSpaceSetting";
import { FC } from "react";

import Page from "../Page";

const AccountSettingPage: FC = () => (
  <Page
    renderItem={(props) => (
      <AccountAndWorkSpaceSetting {...props} tab="account" />
    )}
  />
);

export default AccountSettingPage;
