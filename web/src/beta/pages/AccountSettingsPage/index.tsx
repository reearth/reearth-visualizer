import AccountSetting from "@reearth/beta/features/AccountSetting";
import NotFound from "@reearth/beta/features/NotFound";
import { config } from "@reearth/services/config";
import { FC } from "react";

import Page from "../Page";

const AccountSettingPage: FC = () => (
  <Page
    renderItem={() =>
      config()?.disableWorkspaceManagement ? <NotFound /> : <AccountSetting />
    }
  />
);
export default AccountSettingPage;
