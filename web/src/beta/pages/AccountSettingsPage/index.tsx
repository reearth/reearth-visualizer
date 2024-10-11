import AccountSetting from "@reearth/beta/features/AccountSetting";
import AccountSettingBase from "@reearth/beta/ui/components/AccountSettingBase";
import { FC } from "react";

import Page from "../Page";

const AccountSettingPage: FC = () => (
  <Page
    renderItem={(props) => (
      <AccountSettingBase {...props} tab="account">
        <AccountSetting />
      </AccountSettingBase>
    )}
  />
);

export default AccountSettingPage;
