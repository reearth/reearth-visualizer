import { useMutation } from "@apollo/client/react";
import {
  INSTALL_PLUGIN,
  UPGRADE_PLUGIN,
  UPLOAD_PLUGIN,
  UNINSTALL_PLUGIN
} from "@reearth/services/gql/queries/plugin";
import { useT } from "@reearth/services/i18n/hooks";
import { useNotification } from "@reearth/services/state";
import { useCallback } from "react";

export const usePluginMutations = () => {
  const [, setNotification] = useNotification();
  const t = useT();

  const [installPluginMutation] = useMutation(INSTALL_PLUGIN, {
    refetchQueries: ["GetScene"]
  });
  const [upgradePluginMutation] = useMutation(UPGRADE_PLUGIN, {
    refetchQueries: ["GetScene"]
  });

  const installPlugin = useCallback(
    async (sceneId: string, pluginId: string) => {
      if (!sceneId || !pluginId) return;

      const { errors } = await installPluginMutation({
        variables: { sceneId, pluginId }
      });

      if (errors) {
        setNotification({
          type: "error",
          text: t("Failed to install plugin.")
        });
      } else {
        setNotification({
          type: "success",
          text: t("Successfully installed plugin!")
        });
      }
    },
    [installPluginMutation, t, setNotification]
  );

  const upgradePlugin = useCallback(
    async (sceneId: string, pluginId: string, oldPluginId: string) => {
      if (!sceneId || !pluginId || !oldPluginId) return;

      const { errors } = await upgradePluginMutation({
        variables: {
          sceneId,
          pluginId: oldPluginId,
          toPluginId: pluginId
        }
      });

      if (errors) {
        setNotification({
          type: "error",
          text: t("Failed to upgrade plugin.")
        });
      } else {
        setNotification({
          type: "success",
          text: t("Successfully upgraded plugin!")
        });
      }
    },
    [upgradePluginMutation, t, setNotification]
  );

  const [uploadPluginMutation] = useMutation(UPLOAD_PLUGIN, {
    refetchQueries: ["GetScene"]
  });

  const uploadPlugin = useCallback(
    async (sceneId: string, files?: FileList, url?: string) => {
      if (!sceneId || (!files && !url)) return;

      const results = await Promise.all(
        files
          ? Array.from(files).map((f) =>
              uploadPluginMutation({
                variables: { sceneId: sceneId, file: f }
              })
            )
          : Array.from([url]).map((u) =>
              uploadPluginMutation({
                variables: { sceneId: sceneId, url: u }
              })
            )
      );

      if (!results || results.some((r) => r.errors)) {
        setNotification({
          type: "error",
          text: t("Failed to install plugin.")
        });
      } else {
        setNotification({
          type: "success",
          text: t("Successfully installed plugin!")
        });
      }
    },
    [uploadPluginMutation, t, setNotification]
  );

  const uploadPluginWithFile = useCallback(
    async (sceneId: string, file?: File) => {
      if (!sceneId || !file) return;

      const { errors } = await uploadPluginMutation({
        variables: { sceneId: sceneId, file }
      });

      if (errors) {
        setNotification({
          type: "error",
          text: t("Failed to install plugin.")
        });
      } else {
        setNotification({
          type: "success",
          text: t("Successfully installed plugin!")
        });
      }
    },
    [uploadPluginMutation, t, setNotification]
  );

  const [uninstallPluginMutation] = useMutation(UNINSTALL_PLUGIN, {
    refetchQueries: ["GetScene"]
  });

  const uninstallPlugin = useCallback(
    async (sceneId: string, pluginId: string) => {
      if (!sceneId || !pluginId) return;

      const results = await uninstallPluginMutation({
        variables: { sceneId: sceneId, pluginId: pluginId }
      });

      if (results.errors || !results.data?.uninstallPlugin) {
        setNotification({
          type: "error",
          text: t("Failed to uninstall plugin.")
        });
      } else {
        setNotification({
          type: "info",
          text: t("Successfully uninstalled plugin.")
        });
      }
    },
    [uninstallPluginMutation, t, setNotification]
  );

  return {
    installPlugin,
    upgradePlugin,
    uploadPlugin,
    uploadPluginWithFile,
    uninstallPlugin
  };
};
