import React from "react";

import AccountSection from "@reearth/classic/components/molecules/Settings/Account/AccountSection";
import ProfileSection from "@reearth/classic/components/molecules/Settings/Account/ProfileSection";
import SettingsHeader from "@reearth/classic/components/molecules/Settings/SettingsHeader";
import SettingPage from "@reearth/classic/components/organisms/Settings/SettingPage";
import { useT } from "@reearth/services/i18n";

import useHooks from "./hooks";

export type Props = {};

const Account: React.FC<Props> = () => {
  const t = useT();
  const {
    currentWorkspace,
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
    <SettingPage workspaceId={currentWorkspace?.id} projectId={currentProject?.id}>
      <SettingsHeader title={t("Account")} />
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
