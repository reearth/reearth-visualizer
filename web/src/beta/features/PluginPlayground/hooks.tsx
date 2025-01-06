import { TabItem } from "@reearth/beta/lib/reearth-ui";
import { MapRef } from "@reearth/core";
import { useMemo, useRef } from "react";

import Code from "./Code";
import useCode from "./Code/hook";
import LayerList from "./LayerList";
import Plugins from "./Plugins";
import usePlugins from "./Plugins/usePlugins";
import Viewer from "./Viewer";

export default () => {
  const visualizerRef = useRef<MapRef | null>(null);

  const {
    presetPlugins,
    selectPlugin,
    selectedPlugin,
    selectedFile,
    selectFile,
    addFile,
    updateFileTitle,
    updateFileSourceCode,
    deleteFile,
    handleFileUpload,
    handlePluginDownload,
    encodeAndSharePlugin,
    sharedPlugin
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
        children: <Viewer widgets={widgets} visualizerRef={visualizerRef} />
      }
    ],
    [widgets]
  );

  const LayersTab: TabItem[] = useMemo(
    () => [
      {
        id: "console",
        name: "Layers",
        children: <LayerList visualizerRef={visualizerRef} />
      },
      {
        id: "Settings",
        name: "Settings",
        children: <div>Settings</div>
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
            encodeAndSharePlugin={encodeAndSharePlugin}
            presetPlugins={presetPlugins}
            selectedPlugin={selectedPlugin}
            selectPlugin={selectPlugin}
            selectedFile={selectedFile}
            selectFile={selectFile}
            addFile={addFile}
            updateFileTitle={updateFileTitle}
            deleteFile={deleteFile}
            handleFileUpload={handleFileUpload}
            sharedPlugin={sharedPlugin}
            handlePluginDownload={handlePluginDownload}
          />
        )
      }
    ],
    [
      encodeAndSharePlugin,
      presetPlugins,
      selectedPlugin,
      selectPlugin,
      selectedFile,
      selectFile,
      addFile,
      updateFileTitle,
      deleteFile,
      handleFileUpload,
      sharedPlugin,
      handlePluginDownload
    ]
  );

  const RightAreaTabs: TabItem[] = useMemo(
    () => [
      {
        id: "code",
        name: "Code",
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
      }
    ],
    [selectedFile, executeCode, updateFileSourceCode]
  );

  return {
    MainAreaTabs,
    LayersTab,
    SubRightAreaTabs,
    RightAreaTabs
  };
};
