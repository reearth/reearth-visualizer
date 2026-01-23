import AccountSetting from "@reearth/app/features/AccountSetting";
import NotFound from "@reearth/app/features/NotFound";
import { appFeature } from "@reearth/services/config/appFeatureConfig";
import { FC, useMemo } from "react";

import Page from "../Page";

const AccountSettingPage: FC = () => {
  const disabled = useMemo(() => !appFeature().accountManagement, []);
  return (
    <Page renderItem={() => (disabled ? <NotFound /> : <AccountSetting />)} />
  );
};
export default AccountSettingPage;
