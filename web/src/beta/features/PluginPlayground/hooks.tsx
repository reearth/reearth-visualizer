import { TabItem } from "@reearth/beta/lib/reearth-ui";
import { useMemo } from "react";

import Code from "./Code";
import Console from "./Console";
import PluginInspector from "./PluginInspector";
import Plugins from "./Plugins";
import useFiles from "./Plugins/hook";
import Viewer from "./Viewer";

export default () => {
  const {
    files,
    selectedFile,
    selectFile,
    addFile,
    updateFileTitle,
    deleteFile,
    handleFileUpload
  } = useFiles();

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
            fileTitle={selectedFile.title}
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
