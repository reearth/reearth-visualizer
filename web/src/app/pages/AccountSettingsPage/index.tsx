import AccountSetting from "@reearth/app/features/AccountSetting";
import NotFound from "@reearth/app/features/NotFound";
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
