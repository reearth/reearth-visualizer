import React from "react";
import { useIntl } from "react-intl";

import AccountSection from "@reearth/components/molecules/Settings/Account/AccountSection";
import ProfileSection from "@reearth/components/molecules/Settings/Account/ProfileSection";
import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";

import useHooks from "./hooks";

export type Props = {};

const Account: React.FC<Props> = () => {
  const intl = useIntl();
  const {
    currentTeam,
    currentProject,
    me,
    hasPassword,
    passwordPolicy,
    updateName,
    updatePassword,
    updateLanguage,
    updateTheme,
  } = useHooks();

  return (
    <SettingPage teamId={currentTeam?.id} projectId={currentProject?.id}>
      <SettingsHeader title={intl.formatMessage({ defaultMessage: "Account" })} />
      <ProfileSection username={me?.name} updateName={updateName} />
      {me && (
        <AccountSection
          email={me?.email}
          lang={me?.lang}
          appTheme={me?.theme ? me.theme : "dark"}
          hasPassword={hasPassword}
          passwordPolicy={passwordPolicy}
          updatePassword={updatePassword}
          updateLanguage={updateLanguage}
          updateTheme={updateTheme}
        />
      )}
    </SettingPage>
  );
};

export default Account;
