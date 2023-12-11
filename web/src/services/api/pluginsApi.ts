import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo } from "react";

import {
  INSTALL_PLUGIN,
  UPGRADE_PLUGIN,
  UPLOAD_PLUGIN,
  UNINSTALL_PLUGIN,
} from "@reearth/services/gql/queries/plugin";
import { GET_SCENE } from "@reearth/services/gql/queries/scene";
import { useT, useLang } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";

import { WidgetLayout } from "./widgetsApi";

export enum PluginExtensionType {
  Block = "BLOCK",
  Infobox = "INFOBOX",
  Primitive = "PRIMITIVE",
  Visualizer = "VISUALIZER",
  Widget = "WIDGET",
}

export type Extension = {
  extensionId: string;
  pluginId: string;
  name: string;
  description: string;
  singleOnly?: boolean;
  type: PluginExtensionType;
  // visualizer?: string;
  widgetLayout?: WidgetLayout;
};

export type Plugin = {
  id: string;
  name: string;
  extensions: Extension[];
  property?: unknown;
};

export type MarketplacePlugin = {
  id: string;
  version: string;
  title?: string;
  author?: string;
};

export default () => {
  const [, setNotification] = useNotification();
  const lang = useLang();
  const t = useT();

  const usePluginsQuery = useCallback(
    (sceneId?: string) => {
      const { data, ...rest } = useQuery(GET_SCENE, {
        variables: { sceneId: sceneId ?? "", lang },
        skip: !sceneId,
      });

      const plugins: Plugin[] | undefined = useMemo(
        () =>
          data?.node?.__typename === "Scene"
            ? (data.node.plugins
                .map(p => {
                  if (!p.plugin) return;

                  return {
                    id: p.plugin.id,
                    name: p.plugin.name,
                    extensions: p.plugin.extensions.map(e => {
                      return {
                        pluginId: p.plugin?.id,
                        ...e,
                      };
                    }),
                    property: p.property
                      ? {
                          id: p.property.id,
                          items: p.property.items,
                          schema: p.property.schema,
                        }
                      : {},
                  };
                })
                .filter(p => !!p) as Plugin[])
            : undefined,
        [data?.node],
      );

      return { plugins, ...rest };
    },
    [lang],
  );

  const [installPluginMutation] = useMutation(INSTALL_PLUGIN, {
    refetchQueries: ["GetScene"],
  });
  const [upgradePluginMutation] = useMutation(UPGRADE_PLUGIN, {
    refetchQueries: ["GetScene"],
  });

  const useInstallPlugin = useCallback(
    async (sceneId: string, pluginId: string) => {
      if (!sceneId || !pluginId) return;

      const { errors } = await installPluginMutation({
        variables: { sceneId, pluginId },
      });

      if (errors) {
        setNotification({
          type: "error",
          text: t("Failed to install plugin."),
        });
      } else {
        setNotification({
          type: "success",
          text: t("Successfully installed plugin!"),
        });
      }
    },
    [installPluginMutation, t, setNotification],
  );

  const useUpgradePlugin = useCallback(
    async (sceneId: string, pluginId: string, oldPluginId: string) => {
      if (!sceneId || !pluginId || !oldPluginId) return;

      const { errors } = await upgradePluginMutation({
        variables: {
          sceneId,
          pluginId: oldPluginId,
          toPluginId: pluginId,
        },
      });

      if (errors) {
        setNotification({
          type: "error",
          text: t("Failed to upgrade plugin."),
        });
      } else {
        setNotification({
          type: "success",
          text: t("Successfully upgraded plugin!"),
        });
      }
    },
    [upgradePluginMutation, t, setNotification],
  );

  const [uploadPluginMutation] = useMutation(UPLOAD_PLUGIN, {
    refetchQueries: ["GetScene"],
  });

  const useUploadPlugin = useCallback(
    async (sceneId: string, files?: FileList, url?: string) => {
      if (!sceneId || (!files && !url)) return;

      const results = await Promise.all(
        files
          ? Array.from(files).map(f =>
              uploadPluginMutation({
                variables: { sceneId: sceneId, file: f },
              }),
            )
          : Array.from([url]).map(u =>
              uploadPluginMutation({
                variables: { sceneId: sceneId, url: u },
              }),
            ),
      );

      if (!results || results.some(r => r.errors)) {
        setNotification({
          type: "error",
          text: t("Failed to install plugin."),
        });
      } else {
        setNotification({
          type: "success",
          text: t("Successfully installed plugin!"),
        });
      }
    },
    [uploadPluginMutation, t, setNotification],
  );

  const [uninstallPluginMutation] = useMutation(UNINSTALL_PLUGIN, {
    refetchQueries: ["GetScene"],
  });

  const useUninstallPlugin = useCallback(
    async (sceneId: string, pluginId: string) => {
      if (!sceneId || !pluginId) return;

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
          text: t("Successfully uninstalled plugin."),
        });
      }
    },
    [uninstallPluginMutation, t, setNotification],
  );

  return {
    usePluginsQuery,
    useInstallPlugin,
    useUpgradePlugin,
    useUploadPlugin,
    useUninstallPlugin,
  };
};
