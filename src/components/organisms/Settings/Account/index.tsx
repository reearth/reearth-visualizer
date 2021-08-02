import React from "react";
import { useIntl } from "react-intl";
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";
import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";
import ProfileSection from "@reearth/components/molecules/Settings/Account/ProfileSection";
import AccountSection from "@reearth/components/molecules/Settings/Account/AccountSection";
import useHooks from "./hooks";

export type Props = {};

const Account: React.FC<Props> = () => {
  const intl = useIntl();
  const {
    currentTeam,
    currentProject,
    me,
    hasPassword,
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
          appTheme={me?.theme ? me.theme.toUpperCase() : "DARK"}
          hasPassword={hasPassword}
          updatePassword={updatePassword}
          updateLanguage={updateLanguage}
          updateTheme={updateTheme}
        />
      )}
    </SettingPage>
  );
};

export default Account;
