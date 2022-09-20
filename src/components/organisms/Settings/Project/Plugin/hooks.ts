import { useApolloClient } from "@apollo/client";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@reearth/auth";
import { PluginItem } from "@reearth/components/molecules/Settings/Project/Plugin/PluginSection";
import {
  useGetInstalledPluginsQuery,
  useInstallPluginMutation,
  useUninstallPluginMutation,
  useUploadPluginMutation,
  useUpgradePluginMutation,
} from "@reearth/gql/graphql-client-api";
import { useLang, useT } from "@reearth/i18n";
import { useProject, useNotification, useCurrentTheme } from "@reearth/state";

export type Plugin = {
  fullId: string;
  id: string;
  version: string;
  title?: string;
  author?: string;
};

export default (projectId: string) => {
  const t = useT();
  const locale = useLang();
  const [currentTheme] = useCurrentTheme();
  const client = useApolloClient();
  const [currentProject] = useProject();
  const [, setNotification] = useNotification();
  const { getAccessToken } = useAuth();
  const [accessToken, setAccessToken] = useState<string>();

  useEffect(() => {
    getAccessToken().then(token => {
      setAccessToken(token);
    });
  }, [getAccessToken]);

  const [installPluginMutation] = useInstallPluginMutation();
  const [uploadPluginMutation] = useUploadPluginMutation();
  const [uninstallPluginMutation] = useUninstallPluginMutation();
  const [upgradePluginMutation] = useUpgradePluginMutation();

  const extensions = useMemo(
    () => ({
      library: window.REEARTH_CONFIG?.extensions?.pluginLibrary,
      installed: window.REEARTH_CONFIG?.extensions?.pluginInstalled,
    }),
    [],
  );

  const { data: rawSceneData, loading: sceneLoading } = useGetInstalledPluginsQuery({
    variables: { projectId: projectId ?? "", lang: locale },
    skip: !projectId,
  });

  const sceneId = useMemo(() => rawSceneData?.scene?.id, [rawSceneData]);

  const marketplacePlugins = useMemo(
    () =>
      rawSceneData?.scene?.plugins
        .filter(p => p.plugin && p.plugin?.id !== "reearth")
        .map((p): Plugin | undefined => {
          if (!p.plugin) return;
          const fullId = p.plugin.id;
          const [id, version] = fullId.split("~", 2);
          return {
            fullId,
            id,
            version,
            title: p.plugin.name,
            author: p.plugin.author,
          };
        })
        .filter((p): p is Plugin => !!p) ?? [],
    [rawSceneData],
  );

  const personalPlugins = useMemo(() => {
    return (
      rawSceneData?.scene?.plugins
        .filter(p => p.plugin && p.plugin.id !== "reearth" && p.plugin.id.split("~").length == 3)
        .map<PluginItem>(p => ({
          title: p.plugin?.translatedName ?? "",
          bodyMarkdown: p.plugin?.translatedDescription ?? "",
          author: p.plugin?.author ?? "",
          // thumbnailUrl: p.plugin?.thumbnailUrl,
          isInstalled: true,
          pluginId: p.plugin?.id ?? "",
        })) ?? []
    );
  }, [rawSceneData]);

  const handleInstallByMarketplace = useCallback(
    async (pluginId: string | undefined, oldPluginId?: string) => {
      if (!sceneId || !pluginId) return;

      const results = await (oldPluginId
        ? upgradePluginMutation({
            variables: {
              sceneId,
              pluginId: oldPluginId,
              toPluginId: pluginId,
            },
          })
        : await installPluginMutation({
            variables: { sceneId, pluginId },
          }));

      if (results.errors) {
        setNotification({
          type: "error",
          text: t("Failed to install plugin."),
        });
      } else {
        setNotification({
          type: "success",
          text: t("Successfully installed plugin!"),
        });
        await client.resetStore();
      }
    },
    [client, installPluginMutation, sceneId, setNotification, t, upgradePluginMutation],
  );

  const handleInstallByUploadingZipFile = useCallback(
    async (files: FileList) => {
      if (!sceneId) return;
      const results = await Promise.all(
        Array.from(files).map(f =>
          uploadPluginMutation({
            variables: { sceneId: sceneId, file: f },
          }),
        ),
      );
      if (!results || results.some(r => r.errors)) {
        await client.resetStore();
        setNotification({
          type: "error",
          text: t("Failed to install plugin."),
        });
      } else {
        setNotification({
          type: "success",
          text: t("Successfully installed plugin!"),
        });
        client.resetStore();
      }
    },
    [sceneId, uploadPluginMutation, client, setNotification, t],
  );

  const handleInstallFromPublicRepo = useCallback(
    async (repoUrl: string) => {
      if (!sceneId) return;
      const results = await uploadPluginMutation({
        variables: { sceneId: sceneId, url: repoUrl },
      });
      if (results.errors || !results.data?.uploadPlugin) {
        setNotification({
          type: "error",
          text: t("Failed to install plugin."),
        });
      } else {
        setNotification({
          type: "success",
          text: t("Successfully installed plugin!"),
        });
        await client.resetStore();
      }
    },
    [sceneId, uploadPluginMutation, setNotification, t, client],
  );

  const uninstallPlugin = useCallback(
    async (pluginId: string) => {
      const sceneId = rawSceneData?.scene?.id;
      if (!sceneId) return;
      const results = await uninstallPluginMutation({
        variables: { sceneId: sceneId, pluginId: pluginId },
      });
      if (results.errors || !results.data?.uninstallPlugin) {
        setNotification({
          type: "error",
          text: t("Failed to uninstall plugin."),
        });
      } else {
        setNotification({
          type: "info",
          text: t("Successfully removed plugin."),
        });
        await client.resetStore();
        // await refetchInstalledPlugins();
      }
    },
    [rawSceneData?.scene?.id, uninstallPluginMutation, setNotification, t, client],
  );

  const loading = sceneLoading;
  return {
    currentProject,
    currentTheme,
    currentLang: locale,
    loading,
    marketplacePlugins,
    personalPlugins,
    extensions,
    accessToken,
    handleInstallByMarketplace,
    handleInstallByUploadingZipFile,
    handleInstallFromPublicRepo,
    uninstallPlugin,
  };
};
