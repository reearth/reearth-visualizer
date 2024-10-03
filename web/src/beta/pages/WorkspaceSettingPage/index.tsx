import AccountAndWorkSpaceSetting from "@reearth/beta/features/AccountAndWorkSpaceSetting";
import { FC } from "react";

import Page from "../Page";

const WorkspaceSettingPage: FC = () => (
  <Page
    renderItem={(props) => (
      <AccountAndWorkSpaceSetting {...props} tab="workspace" />
    )}
  />
);

export default WorkspaceSettingPage;
