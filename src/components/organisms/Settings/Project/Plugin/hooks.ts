import { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

import { PluginItem } from "@reearth/components/molecules/Settings/Project/Plugin/PluginSection";
import {
  useInstallablePluginsQuery,
  useInstalledPluginsQuery,
  useUninstallPluginMutation,
  useUploadPluginMutation,
} from "@reearth/gql/graphql-client-api";
import { useTeam, useProject, useNotification } from "@reearth/state";

export default (projectId: string) => {
  const intl = useIntl();
  const [currentTeam] = useTeam();
  const [currentProject] = useProject();
  const [, setNotification] = useNotification();

  const { loading: pluginLoading } = useInstallablePluginsQuery();
  const [uploadPluginMutation] = useUploadPluginMutation();
  const [uninstallPluginMutation] = useUninstallPluginMutation();

  const {
    data: rawSceneData,
    loading: sceneLoading,
    refetch: refetchInstalledPlugins,
  } = useInstalledPluginsQuery({
    variables: { projectId: projectId ?? "" },
    skip: !projectId,
  });

  const installedPlugins = useMemo(() => {
    return rawSceneData
      ? rawSceneData?.scene?.plugins
          .filter(p => p.plugin?.id !== "reearth")
          .map<PluginItem>(p => ({
            title: p.plugin?.name ?? "",
            bodyMarkdown: p.plugin?.description ?? "",
            author: p.plugin?.author ?? "",
            // thumbnailUrl: p.plugin?.thumbnailUrl,
            isInstalled: true,
            pluginId: p.plugin?.id ?? "",
          }))
      : [];
  }, [rawSceneData]);

  const installByUploadingZipFile = useCallback(
    async (files: FileList) => {
      const sceneId = rawSceneData?.scene?.id;
      if (!sceneId) return;
      const results = await Promise.all(
        Array.from(files).map(f =>
          uploadPluginMutation({
            variables: { sceneId: sceneId, file: f },
          }),
        ),
      );
      if (results) {
        setNotification({
          type: "success",
          text: intl.formatMessage({ defaultMessage: "Successfully installed plugin!" }),
        });
        await refetchInstalledPlugins();
      } else {
        setNotification({
          type: "error",
          text: intl.formatMessage({ defaultMessage: "Failed to install plugin." }),
        });
      }
    },
    [rawSceneData?.scene?.id, refetchInstalledPlugins, uploadPluginMutation, setNotification, intl],
  );

  const installFromPublicRepo = useCallback(
    async (repoUrl: string) => {
      const sceneId = rawSceneData?.scene?.id;
      if (!sceneId) return;
      const results = await uploadPluginMutation({
        variables: { sceneId: sceneId, url: repoUrl },
      });
      if (results.errors || !results.data?.uploadPlugin) {
        setNotification({
          type: "error",
          text: intl.formatMessage({ defaultMessage: "Failed to install plugin." }),
        });
      } else {
        setNotification({
          type: "success",
          text: intl.formatMessage({ defaultMessage: "Successfully installed plugin!" }),
        });
        await refetchInstalledPlugins();
      }
    },
    [rawSceneData?.scene?.id, refetchInstalledPlugins, uploadPluginMutation, setNotification, intl],
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
          text: intl.formatMessage({ defaultMessage: "Failed to uninstall plugin." }),
        });
      } else {
        setNotification({
          type: "info",
          text: intl.formatMessage({ defaultMessage: "Successfully removed plugin." }),
        });
        await refetchInstalledPlugins();
      }
    },
    [
      rawSceneData?.scene?.id,
      refetchInstalledPlugins,
      uninstallPluginMutation,
      setNotification,
      intl,
    ],
  );

  const loading = sceneLoading || pluginLoading;
  return {
    currentTeam,
    currentProject,
    loading,
    installedPlugins,
    installByUploadingZipFile,
    installFromPublicRepo,
    uninstallPlugin,
  };
};
