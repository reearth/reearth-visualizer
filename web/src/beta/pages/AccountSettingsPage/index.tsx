import AccountSetting from "@reearth/beta/features/AccountSetting";
import { FC } from "react";

import Page from "../Page";

const AccountSettingPage: FC = () => (
  <Page renderItem={() => <AccountSetting />} />
);

export default AccountSettingPage;
