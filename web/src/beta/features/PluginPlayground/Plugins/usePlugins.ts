import { useNotification } from "@reearth/services/state";
import JSZip from "jszip";
import LZString from "lz-string";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useFileInput from "use-file-input";
import { v4 as uuidv4 } from "uuid";

import { PluginType } from "./constants";
import { presetPlugins } from "./presets";
import { validateFileTitle } from "./utils";

export default () => {
  const [searchParams] = useSearchParams();
  const [, setNotification] = useNotification();

  const sharedPluginUrl = searchParams.get("plugin");

  const decodePluginURL = useCallback((encoded: string) => {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    // Decompress and parse
    const decompressed = LZString.decompressFromBase64(base64);

    return JSON.parse(decompressed);
  }, []);

  const sharedPlugin = sharedPluginUrl
    ? (() => {
        try {
          return decodePluginURL(sharedPluginUrl);
        } catch (_error) {
          setNotification({ type: "error", text: "Invalid shared plugin URL" });
          return null;
        }
      })()
    : null;

  const presetPluginsArray = presetPlugins
    .map((category) => category.plugins)
    .flat();

  const [plugins, setPlugins] = useState<PluginType[]>(
    sharedPlugin ? [sharedPlugin, ...presetPluginsArray] : presetPluginsArray
  );

  const [selectedPluginId, setSelectedPluginId] = useState(plugins[0].id);
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

  const selectPlugin = useCallback((pluginId: string) => {
    setSelectedPluginId(pluginId);
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

  const handleFileUpload = useFileInput((fileList) => {
    const file = fileList?.[0];
    if (!file) {
      return;
    }
    const result = validateFileTitle(
      file.name,
      selectedPlugin.files.map((f) => f.title)
    );
    if (!result.success) {
      setNotification({ type: "error", text: result.message });
      return;
    }

    const reader = new FileReader();

    reader.onload = async (event) => {
      const body = event?.target?.result;
      if (typeof body != "string") return;
      const fileItem = {
        id: uuidv4(),
        title: file.name,
        sourceCode: body
      };
      // Note: When a new file is uploaded, select that file
      setSelectedFileId(fileItem.id);
      setPlugins((plugins) =>
        plugins.map((plugin) =>
          plugin.id === selectedPlugin.id
            ? { ...plugin, files: [...plugin.files, fileItem] }
            : plugin
        )
      );
    };
    reader.readAsText(file);
  });

  const handlePluginDownload = useCallback(async () => {
    try {
      const zip = new JSZip();
      const pluginFolder = zip.folder(selectedPlugin.title);
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
      link.download = `${selectedPlugin.title}.zip`;
      link.click();
      URL.revokeObjectURL(zipUrl);
    } catch (error) {
      if (error instanceof Error) {
        setNotification({ type: "error", text: error.message });
      }
    }
  }, [selectedPlugin, setNotification]);

  const encodeAndSharePlugin = useCallback(
    (pluginId: string): string | undefined => {
      selectPlugin(pluginId);
      // Need to do a find here as the selectedPlugin does not get updated immediately
      const sharedPlugin = plugins.find((plugin) => plugin.id === pluginId);

      // Note: We can't use the same id for a shared plugin
      const selectedPluginCopy = { ...sharedPlugin, id: uuidv4() };

      // First compress the code
      try {
        const compressed = LZString.compressToBase64(
          JSON.stringify(selectedPluginCopy)
        )
          .replace(/\+/g, "-") // Convert + to -
          .replace(/\//g, "_") // Convert / to _
          .replace(/=/g, ""); // Remove padding =

        const shareUrl = `${window.location.origin}${window.location.pathname}?plugin=${compressed}`;
        navigator.clipboard.writeText(shareUrl);

        setNotification({
          type: "success",
          text: "Plugin link copied to clipboard"
        });
        return compressed;
      } catch (error) {
        if (error instanceof Error) {
          setNotification({ type: "error", text: error.message });
        }
        return;
      }
    },
    [plugins, selectPlugin, setNotification]
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
    handleFileUpload,
    handlePluginDownload,
    sharedPlugin
  };
};
