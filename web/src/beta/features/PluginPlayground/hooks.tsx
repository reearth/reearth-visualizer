import { TabItem } from "@reearth/beta/lib/reearth-ui";
import { useCallback, useMemo, useState } from "react";
import useFileInput from "use-file-input";

import Code from "./Code";
import Console from "./Console";
import PluginInspector from "./PluginInspector";
import Plugins from "./Plugins";
import Viewer from "./Viewer";

export type FileType = {
  id: string;
  title: string;
  sourceCode: string;
};

const REEARTH_YML_FILE = {
  id: "reearth-yml",
  title: "reearth.yml",
  sourceCode: `
id: reearth-visualizer-plugin-shadcn-template
name: Visualizer plugin shadcn template
version: 1.0.0
extensions:
- id: demo
  type: widget
  name: Demo
  schema:
    groups:
      - id: appearance
        title: Appearance
        defaultLocation:
          - zone: inner
            section: right
            area: bottom
        fields:
          - id: primary_color
            title: Primary color
            type: string
            ui: color
  `
} as const;

export const ALLOWED_FILE_EXTENSIONS = ["yaml", "yml", "js"] as const;

export default () => {
  const [files, setFiles] = useState<FileType[]>([REEARTH_YML_FILE]);
  const [selectedFile, setSelectedFile] = useState<FileType>(REEARTH_YML_FILE);

  const selectFile = useCallback((file: FileType) => {
    setSelectedFile(file);
  }, []);

  const addFile = useCallback((file: FileType) => {
    setFiles((files) => [...files, file]);
  }, []);

  const updateFileTitle = useCallback((id: string, newTitle: string) => {
    setFiles((files) =>
      files.map((file) =>
        file.id === id ? { ...file, title: newTitle } : file
      )
    );
  }, []);

  const deleteFile = useCallback((id: string) => {
    setFiles((files) => files.filter((file) => file.id !== id));
  }, []);

  const handleFileUpload = useFileInput((files) => {
    const file = files?.[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = async (e2) => {
      const body = e2?.target?.result;
      if (typeof body != "string") return;
      const fileItem = {
        id:
          // gerate unique id
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15),
        title: file.name,
        sourceCode: body
      };
      // Note: When a new file is uploaded, select that file
      setSelectedFile(fileItem);
      setFiles((files) => [...files, fileItem]);
    };
    reader.readAsText(file);
  });

  // Note: currently we put visualizer in tab content, so better not have more tabs in this area,
  // otherwise visualizer will got unmount and mount when switching tabs.
  const MainAreaTabs: TabItem[] = useMemo(
    () => [
      {
        id: "viewer",
        name: "Viewer",
        children: <Viewer />
      }
    ],
    []
  );

  const BottomAreaTabs: TabItem[] = useMemo(
    () => [
      {
        id: "console",
        name: "Console",
        children: <Console />
      }
    ],
    []
  );

  const SubRightAreaTabs: TabItem[] = useMemo(
    () => [
      {
        id: "plugins",
        name: "Plugins",
        children: (
          <Plugins
            files={files}
            selectedFile={selectedFile}
            selectFile={selectFile}
            addFile={addFile}
            updateFileTitle={updateFileTitle}
            deleteFile={deleteFile}
            handleFileUpload={handleFileUpload}
          />
        )
      }
    ],
    [
      files,
      selectedFile,
      selectFile,
      addFile,
      updateFileTitle,
      deleteFile,
      handleFileUpload
    ]
  );

  const RightAreaTabs: TabItem[] = useMemo(
    () => [
      {
        id: "code",
        name: "code",
        children: (
          <Code
            fileName={selectedFile.title}
            sourceCode={selectedFile.sourceCode}
          />
        )
      },
      {
        id: "plugin-inspector",
        name: "Plugin Inspector",
        children: <PluginInspector />
      }
    ],
    [selectedFile]
  );

  return {
    MainAreaTabs,
    BottomAreaTabs,
    SubRightAreaTabs,
    RightAreaTabs
  };
};
