import React from "react";

import ArchivedMessage from "@reearth/components/molecules/Settings/Project/ArchivedMessage";
import PluginSection from "@reearth/components/molecules/Settings/Project/Plugin/PluginSection";
import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";
import { useT } from "@reearth/i18n";

import useHooks from "./hooks";

export type Props = {
  projectId: string;
};

const Plugin: React.FC<Props> = ({ projectId }) => {
  const t = useT();
  const {
    currentProject,
    currentTheme,
    currentLang,
    loading,
    marketplacePlugins,
    personalPlugins,
    extensions,
    accessToken,
    handleInstallPluginByMarketplace,
    handleInstallPluginFromFile,
    handleInstallPluginFromPublicRepo,
    handleUninstallPlugin,
  } = useHooks(projectId);

  return (
    <SettingPage projectId={projectId}>
      <SettingsHeader title={t("Plugins")} currentProject={currentProject?.name} />
      {!currentProject?.isArchived ? (
        <PluginSection
          loading={loading}
          marketplacePlugins={marketplacePlugins}
          personalPlugins={personalPlugins}
          extensions={extensions}
          currentTheme={currentTheme}
          currentLang={currentLang}
          accessToken={accessToken}
          onInstallFromMarketplace={handleInstallPluginByMarketplace}
          onInstallFromFile={handleInstallPluginFromFile}
          onInstallFromPublicRepo={handleInstallPluginFromPublicRepo}
          onUninstall={handleUninstallPlugin}
        />
      ) : (
        <ArchivedMessage />
      )}
    </SettingPage>
  );
};

export default Plugin;
