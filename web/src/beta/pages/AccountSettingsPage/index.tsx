import AccountSetting from "@reearth/beta/features/AccountSetting";
import NotFound from "@reearth/beta/features/NotFound";
import { config } from "@reearth/services/config";
import { FC, useMemo } from "react";

import Page from "../Page";

const AccountSettingPage: FC = () => {
  const disabled = useMemo(() => config()?.disableWorkspaceManagement, []);
  return (
    <Page renderItem={() => (disabled ? <NotFound /> : <AccountSetting />)} />
  );
};
export default AccountSettingPage;
