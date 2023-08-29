import { useCallback } from "react";

import { usePluginsFetcher } from "@reearth/services/api";

export default ({ projectId, sceneId }: { projectId: string; sceneId?: string }) => {
  const {
    useInstalledPluginsQuery,
    useInstallPlugin,
    useUpgradePlugin,
    useUploadPlugin,
    useUninstallPlugin,
  } = usePluginsFetcher();

  const { marketplacePlugins, personalPlugins, loading } = useInstalledPluginsQuery(projectId);

  const handleInstallPluginByMarketplace = useCallback(
    async (pluginId: string | undefined, oldPluginId?: string) => {
      if (!sceneId || !pluginId) return;

      if (oldPluginId) {
        await useUpgradePlugin(sceneId, pluginId, oldPluginId);
      } else {
        await useInstallPlugin(sceneId, pluginId);
      }
    },
    [sceneId, useInstallPlugin, useUpgradePlugin],
  );

  const handleInstallPluginFromFile = useCallback(
    async (files: FileList) => {
      if (!sceneId) return;
      useUploadPlugin(sceneId, files);
    },
    [sceneId, useUploadPlugin],
  );

  const handleInstallPluginFromPublicRepo = useCallback(
    async (repoUrl: string) => {
      if (!sceneId) return;
      useUploadPlugin(sceneId, undefined, repoUrl);
    },
    [sceneId, useUploadPlugin],
  );

  const handleUninstallPlugin = useCallback(
    async (pluginId: string) => {
      if (!sceneId) return;
      useUninstallPlugin(sceneId, pluginId);
    },
    [sceneId, useUninstallPlugin],
  );

  return {
    loading,
    personalPlugins,
    marketplacePlugins,
    handleInstallPluginByMarketplace,
    handleInstallPluginFromFile,
    handleInstallPluginFromPublicRepo,
    handleUninstallPlugin,
  };
};
