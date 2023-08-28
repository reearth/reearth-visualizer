import { useApolloClient } from "@apollo/client";
import { useCallback, useMemo } from "react";

// TODO: migrate to services API
import {
  useGetInstalledPluginsQuery,
  useInstallPluginMutation,
  useUninstallPluginMutation,
  useUploadPluginMutation,
  useUpgradePluginMutation,
} from "@reearth/classic/gql/graphql-client-api";
import { useT, useLang } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";

export type Plugin = {
  fullId: string;
  id: string;
  version: string;
  title?: string;
  author?: string;
};

export default ({ projectId, sceneId }: { projectId: string; sceneId?: string }) => {
  const [installPluginMutation] = useInstallPluginMutation();
  const [uploadPluginMutation] = useUploadPluginMutation();
  const [uninstallPluginMutation] = useUninstallPluginMutation();
  const [upgradePluginMutation] = useUpgradePluginMutation();

  const t = useT();
  const lang = useLang();
  const client = useApolloClient();
  const [, setNotification] = useNotification();

  const { data: rawSceneData, loading } = useGetInstalledPluginsQuery({
    variables: { projectId: projectId ?? "", lang },
    skip: !projectId,
  });

  const marketplacePlugins = useMemo(
    () =>
      rawSceneData?.scene?.plugins
        .filter(p => p.plugin && p.plugin?.id !== "reearth" && p.plugin.id.split("~", 3).length < 3)
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
        .filter(p => p.plugin && p.plugin.id !== "reearth" && p.plugin.id.split("~", 3).length == 3)
        .map(p => ({
          title: p.plugin?.translatedName ?? "",
          bodyMarkdown: p.plugin?.translatedDescription ?? "",
          author: p.plugin?.author ?? "",
          isInstalled: true,
          pluginId: p.plugin?.id ?? "",
        })) ?? []
    );
  }, [rawSceneData]);

  const handleInstallPluginByMarketplace = useCallback(
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
        : installPluginMutation({
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

  const handleInstallPluginFromFile = useCallback(
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

  const handleInstallPluginFromPublicRepo = useCallback(
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

  const handleUninstallPlugin = useCallback(
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
      }
    },
    [rawSceneData?.scene?.id, uninstallPluginMutation, setNotification, t, client],
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
