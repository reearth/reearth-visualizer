import { useCallback, useMemo } from "react";

import { useTeam, useProject } from "@reearth/state";
import { PluginItem } from "@reearth/components/molecules/Settings/Project/Plugin/PluginSection";
import {
  useInstallablePluginsQuery,
  useInstalledPluginsQuery,
  useUninstallPluginMutation,
  useUploadPluginMutation,
} from "@reearth/gql/graphql-client-api";

export default (projectId: string) => {
  const [currentTeam] = useTeam();
  const [currentProject] = useProject();

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
      await Promise.all(
        Array.from(files).map(f =>
          uploadPluginMutation({
            variables: { sceneId: sceneId, file: f },
          }),
        ),
      );
      await refetchInstalledPlugins();
    },
    [rawSceneData?.scene?.id, refetchInstalledPlugins, uploadPluginMutation],
  );

  const installFromPublicRepo = useCallback(
    async (repoUrl: string) => {
      const sceneId = rawSceneData?.scene?.id;
      if (!sceneId) return;
      await uploadPluginMutation({
        variables: { sceneId: sceneId, url: repoUrl },
      });
      await refetchInstalledPlugins();
    },
    [rawSceneData?.scene?.id, refetchInstalledPlugins, uploadPluginMutation],
  );

  const uninstallPlugin = useCallback(
    async (pluginId: string) => {
      const sceneId = rawSceneData?.scene?.id;
      if (!sceneId) return;
      await uninstallPluginMutation({ variables: { sceneId: sceneId, pluginId: pluginId } });
      await refetchInstalledPlugins();
    },
    [rawSceneData?.scene?.id, refetchInstalledPlugins, uninstallPluginMutation],
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
