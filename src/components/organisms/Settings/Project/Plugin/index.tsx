import React from "react";

import ArchivedMessage from "@reearth/components/molecules/Settings/Project/ArchivedMessage";
import PluginSection from "@reearth/components/molecules/Settings/Project/Plugin/PluginSection";
import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";
import { useT } from "@reearth/i18n";

import useHooks from "./hooks";

// Components

type Props = {
  projectId: string;
};

const Plugin: React.FC<Props> = ({ projectId }) => {
  const t = useT();
  const {
    currentProject,
    marketplacePluginIds,
    personalPlugins,
    loading,
    extensions,
    accessToken,
    handleInstallByMarketplace,
    handleInstallByUploadingZipFile,
    handleInstallFromPublicRepo,
    uninstallPlugin,
  } = useHooks(projectId);

  return (
    <SettingPage projectId={projectId}>
      <SettingsHeader title={t("Plugins")} currentProject={currentProject?.name} />
      {!currentProject?.isArchived ? (
        <PluginSection
          loading={loading}
          marketplacePluginIds={marketplacePluginIds}
          personalPlugins={personalPlugins}
          extensions={extensions}
          accessToken={accessToken}
          onInstallByMarketplace={handleInstallByMarketplace}
          onInstallByUploadingZipFile={handleInstallByUploadingZipFile}
          onInstallFromPublicRepo={handleInstallFromPublicRepo}
          uninstallPlugin={uninstallPlugin}
        />
      ) : (
        <ArchivedMessage />
      )}
    </SettingPage>
  );
};

export default Plugin;
