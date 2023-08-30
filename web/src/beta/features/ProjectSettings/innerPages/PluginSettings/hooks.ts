import { useCallback, useMemo } from "react";

import { usePluginsFetcher } from "@reearth/services/api";
import { ScenePlugin } from "@reearth/services/gql";

export type MarketplacePlugin = {
  id: string;
  version: string;
  title?: string;
  author?: string;
};

export default ({ sceneId, plugins }: { sceneId?: string; plugins?: ScenePlugin[] }) => {
  const { useInstallPlugin, useUpgradePlugin, useUploadPlugin, useUninstallPlugin } =
    usePluginsFetcher();

  const marketplacePlugins = useMemo(
    () =>
      plugins
        ?.filter(
          p => p.plugin && p.plugin?.id !== "reearth" && p.plugin.id.split("~", 3).length < 3,
        )
        .map((p): MarketplacePlugin | undefined => {
          if (!p.plugin) return;
          const [id, version] = p.plugin.id.split("~", 2);
          return {
            id,
            version,
            title: p.plugin.name,
            author: p.plugin.author,
          };
        })
        .filter((p): p is MarketplacePlugin => !!p) ?? [],
    [plugins],
  );

  const personalPlugins = useMemo(
    () =>
      plugins
        ?.filter(
          p => p.plugin && p.plugin.id !== "reearth" && p.plugin.id.split("~", 3).length == 3,
        )
        .map(p => ({
          title: p.plugin?.translatedName ?? p.plugin?.name ?? "",
          bodyMarkdown: p.plugin?.translatedDescription ?? p.plugin?.description ?? "",
          author: p.plugin?.author ?? "",
          isInstalled: true,
          pluginId: p.plugin?.id ?? "",
        })) ?? [],
    [plugins],
  );

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
    personalPlugins,
    marketplacePlugins,
    handleInstallPluginByMarketplace,
    handleInstallPluginFromFile,
    handleInstallPluginFromPublicRepo,
    handleUninstallPlugin,
  };
};
