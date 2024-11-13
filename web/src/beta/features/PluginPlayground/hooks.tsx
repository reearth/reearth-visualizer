import { TabItem } from "@reearth/beta/lib/reearth-ui";
import { useMemo } from "react";

import Code from "./Code";
import useCode from "./Code/hook";
import Console from "./Console";
import PluginInspector from "./PluginInspector";
import Plugins from "./Plugins";
import usePlugins from "./Plugins/hook";
import Viewer from "./Viewer";

export default () => {
  const {
    plugins,
    selectPlugin,
    selectedPlugin,
    selectedFile,
    selectFile,
    addFile,
    updateFileTitle,
    updateFileSourceCode,
    deleteFile,
    handleFileUpload,
    handlePluginDownload
  } = usePlugins();

  const { widgets, executeCode } = useCode({
    files: selectedPlugin.files
  });

  // Note: currently we put visualizer in tab content, so better not have more tabs in this area,
  // otherwise visualizer will got unmount and mount when switching tabs.
  const MainAreaTabs: TabItem[] = useMemo(
    () => [
      {
        id: "viewer",
        name: "Viewer",
        children: <Viewer widgets={widgets} />
      }
    ],
    [widgets]
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
            plugins={plugins}
            selectedPlugin={selectedPlugin}
            selectPlugin={selectPlugin}
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
      plugins,
      selectedPlugin,
      selectPlugin,
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
            executeCode={executeCode}
            onChangeSourceCode={(value) => {
              updateFileSourceCode(
                value ?? selectedFile.sourceCode,
                selectedFile.id
              );
            }}
          />
        )
      },
      {
        id: "plugin-inspector",
        name: "Plugin Inspector",
        children: (
          <PluginInspector handlePluginDownload={handlePluginDownload} />
        )
      }
    ],
    [selectedFile, handlePluginDownload, executeCode, updateFileSourceCode]
  );

  return {
    MainAreaTabs,
    BottomAreaTabs,
    SubRightAreaTabs,
    RightAreaTabs
  };
};
