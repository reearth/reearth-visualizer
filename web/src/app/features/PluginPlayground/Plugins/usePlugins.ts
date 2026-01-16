import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import JSZip from "jszip";
import LZString from "lz-string";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import useFileInput from "use-file-input";
import { v4 as uuidv4 } from "uuid";

import { PluginType, SHARED_PLUGIN_ID } from "./constants";
import { presetPlugins } from "./presets";
import { validateFileTitle } from "./utils";

export default () => {
  const [, setNotification] = useNotification();
  const [searchParams] = useSearchParams();
  const t = useT();
  const pluginIdParam = searchParams.get("plugin-id");
  const sharedPluginURLParam = searchParams.get("shared-plugin");
  const presetPluginsArray = presetPlugins
    .map((category) => category.plugins)
    .flat();

  const decodePluginURL = useCallback((encoded: string) => {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    // Decompress and parse
    const decompressed = LZString.decompressFromBase64(base64);

    return JSON.parse(decompressed);
  }, []);

  const sharedPlugin: PluginType = sharedPluginURLParam
    ? (() => {
        try {
          return decodePluginURL(sharedPluginURLParam);
        } catch (_error) {
          setNotification({
            type: "error",
            text: t("Invalid shared plugin URL")
          });
          return null;
        }
      })()
    : null;

  const [plugins, setPlugins] = useState<PluginType[]>(
    sharedPlugin && sharedPlugin.id === SHARED_PLUGIN_ID
      ? [sharedPlugin, ...presetPluginsArray]
      : presetPluginsArray
  );
  const [selectedPluginId, setSelectedPluginId] = useState(
    sharedPlugin
      ? sharedPlugin.id
      : pluginIdParam
        ? pluginIdParam
        : plugins[0].id
  );

  const [selectedFileId, setSelectedFileId] = useState<string>(
    plugins[0]?.files[0]?.id ?? ""
  );

  const selectedPlugin = useMemo(
    () =>
      plugins.find((plugin) => plugin.id === selectedPluginId) ?? plugins[0],
    [plugins, selectedPluginId]
  );

  const selectedFile = useMemo(
    () =>
      selectedPlugin.files.find((file) => file.id === selectedFileId) ??
      selectedPlugin.files[0],
    [selectedPlugin, selectedFileId]
  );

  useEffect(() => {
    window.history.replaceState({}, "", `?plugin-id=${selectedPluginId}`);
  }, [selectedPluginId]);

  const selectPlugin = useCallback((pluginId: string) => {
    setSelectedPluginId(pluginId);
    setSelectedFileId("");
  }, []);

  const selectFile = useCallback((fileId: string) => {
    setSelectedFileId(fileId);
  }, []);

  const addFile = useCallback(
    (title: string) => {
      const result = validateFileTitle(
        title,
        selectedPlugin.files.map((f) => f.title)
      );
      if (!result.success) {
        setNotification({ type: "error", text: result.message });
        return;
      }
      const newFile = {
        id: uuidv4(),
        title,
        sourceCode: ""
      };

      setPlugins((plugins) =>
        plugins.map((plugin) =>
          plugin.id === selectedPlugin.id
            ? { ...plugin, files: [...plugin.files, newFile] }
            : plugin
        )
      );

      setSelectedFileId(newFile.id);
    },
    [selectedPlugin, setNotification]
  );

  const updateFileTitle = useCallback(
    (newTitle: string, id: string) => {
      const result = validateFileTitle(
        newTitle,
        selectedPlugin.files.map((f) => f.title)
      );

      if (!result.success) {
        setNotification({ type: "error", text: result.message });
        return;
      }

      setPlugins((plugins) =>
        plugins.map((plugin) =>
          plugin.id === selectedPlugin.id
            ? {
                ...plugin,
                files: plugin.files.map((file) =>
                  file.id === id ? { ...file, title: newTitle } : file
                )
              }
            : plugin
        )
      );

      return;
    },
    [selectedPlugin, setNotification]
  );

  const updateFileSourceCode = useCallback(
    (sourceCode: string, id: string) => {
      setPlugins((plugins) =>
        plugins.map((plugin) =>
          plugin.id === selectedPlugin.id
            ? {
                ...plugin,
                files: plugin.files.map((file) =>
                  file.id === id ? { ...file, sourceCode } : file
                )
              }
            : plugin
        )
      );
    },
    [selectedPlugin]
  );

  const deleteFile = useCallback(
    (id: string) => {
      if (id === selectedFileId) {
        setSelectedFileId(selectedPlugin.files[0].id);
      }
      setPlugins((plugins) =>
        plugins.map((plugin) =>
          plugin.id === selectedPlugin.id
            ? {
                ...plugin,
                files: plugin.files.filter((file) => file.id !== id)
              }
            : plugin
        )
      );
    },
    [selectedPlugin, selectedFileId]
  );

  const handlePluginImport = useFileInput(
    (fileList) => {
      const file = fileList?.[0];
      if (!file) {
        setNotification({ type: "error", text: t("File not found") });
        return;
      }

      if (!file.name.toLowerCase().endsWith(".zip")) {
        setNotification({
          type: "error",
          text: t("Only zip files are supported")
        });
        return;
      }

      const zip = new JSZip();
      zip.loadAsync(file).then((zip) => {
        const files = Object.values(zip.files).filter((file) => !file.dir);

        if (files.length === 0) {
          setNotification({ type: "error", text: t("Zip file is empty") });
          return;
        }

        const filePromises = files.map((file) => file.async("text"));

        Promise.all(filePromises)
          .then((fileContents) => {
            const pluginFiles = fileContents.map((content, index) => ({
              id: uuidv4(),
              title: files[index].name.split("/")[1],
              sourceCode: content
            }));

            const newPlugin = {
              id: "my-plugin", // NOTE: id of the custom plugin
              files: pluginFiles
            };

            setPlugins((plugins) => [
              newPlugin,
              ...plugins.filter((plugin) => plugin.id !== "my-plugin")
            ]);
            setSelectedPluginId(newPlugin.id);
            setSelectedFileId(newPlugin.files[0].id);
          })
          .catch((err) => {
            setNotification({
              type: "error",
              text: `Failed to load ZIP: ${err.message}`
            });
          });
      });
    },
    { accept: "application/zip", multiple: false }
  );

  const handlePluginDownload = useCallback(async () => {
    try {
      const zip = new JSZip();
      const pluginFolder = zip.folder(selectedPlugin.id);
      if (!pluginFolder) {
        throw new Error("Failed to create plugin folder");
      }

      selectedPlugin.files.forEach((file) => {
        pluginFolder.file(file.title, file.sourceCode);
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = zipUrl;
      link.download = `${selectedPlugin.id}.zip`;
      link.click();
      URL.revokeObjectURL(zipUrl);
    } catch (error) {
      if (error instanceof Error) {
        setNotification({ type: "error", text: error.message });
      }
    }
  }, [selectedPlugin, setNotification]);

  const encodeAndSharePlugin = useCallback(
    (pluginId: string) => {
      try {
        const pluginToShare = plugins.find((plugin) => plugin.id === pluginId);
        const selectedPluginCopy = { ...pluginToShare, id: SHARED_PLUGIN_ID };

        const compressed = LZString.compressToBase64(
          JSON.stringify(selectedPluginCopy)
        )
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=/g, "");

        const shareUrl = `${window.location.origin}${window.location.pathname}?shared-plugin=${compressed}`;
        navigator.clipboard.writeText(shareUrl);

        setNotification({
          type: "success",
          text: t("Plugin link copied to clipboard")
        });
      } catch (error) {
        if (error instanceof Error) {
          setNotification({ type: "error", text: error.message });
        }
        return;
      }
    },
    [setNotification, t, plugins]
  );

  return {
    encodeAndSharePlugin,
    presetPlugins,
    selectPlugin,
    selectedPlugin,
    selectFile,
    selectedFile,
    addFile,
    updateFileTitle,
    updateFileSourceCode,
    deleteFile,
    handlePluginImport,
    handlePluginDownload,
    sharedPlugin
  };
};
