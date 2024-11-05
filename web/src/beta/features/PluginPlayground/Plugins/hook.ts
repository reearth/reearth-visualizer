import JSZip from "jszip";
import { useCallback, useMemo, useState } from "react";
import useFileInput from "use-file-input";

import { PluginType, REEARTH_YML_FILE } from "./constants";
import { validateFileTitle } from "./utils";

export default () => {
  const [plugins, setPlugins] = useState<PluginType[]>([
    {
      id: generateUniqueId(),
      title: "My Plugin",
      files: [
        REEARTH_YML_FILE,
        {
          id: generateUniqueId(),
          title: "button.js",
          sourceCode: `reearth.ui.show(\`
  <style>
    body {
      margin: 0;
    }
    #wrapper {
      background: #232226;
      height: 100%;
      color: white;
      border: 3px dotted red;
      border-radius: 5px;
      padding: 20px 0;
    }
  </style>
  <div id="wrapper">
    <h2 style="text-align: center; margin: 0;">Hello World</h2>
  </div>
\`);
          
          `
        }
      ]
    }
  ]);

  const [selectedPluginId, setSelectedPluginId] = useState(plugins[0].id);
  const [selectedFileId, setSelectedFileId] = useState<string>(
    REEARTH_YML_FILE.id
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
        return;
      }
      const newFile = {
        id: generateUniqueId(),
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
    [selectedPlugin]
  );

  const updateFileTitle = useCallback(
    (newTitle: string, id: string) => {
      const result = validateFileTitle(
        newTitle,
        selectedPlugin.files.map((f) => f.title)
      );

      if (!result.success) {
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
    [selectedPlugin]
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
    [selectedPlugin]
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
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e2) => {
      const body = e2?.target?.result;
      if (typeof body != "string") return;
      const fileItem = {
        id: generateUniqueId(),
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
    const zip = new JSZip();
    const pluginFolder = zip.folder(selectedPlugin.title);

    selectedPlugin.files.forEach((file) => {
      pluginFolder?.file(file.title, file.sourceCode);
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const zipUrl = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = zipUrl;
    link.download = `${selectedPlugin.title}.zip`;
    link.click();
    URL.revokeObjectURL(zipUrl);
  }, [selectedPlugin]);

  return {
    plugins,
    selectPlugin,
    selectedPlugin,
    selectFile,
    selectedFile,
    addFile,
    updateFileTitle,
    updateFileSourceCode,
    deleteFile,
    handleFileUpload,
    handlePluginDownload
  };
};

const generateUniqueId = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};
