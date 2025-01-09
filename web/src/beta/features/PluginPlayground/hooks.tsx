import { TabItem } from "@reearth/beta/lib/reearth-ui";
import { Layer, MapRef } from "@reearth/core";
import { FC, useMemo, useRef, useState } from "react";

import Code from "./Code";
import useCode from "./Code/hook";
import LayerList from "./LayerList";
import { DEFAULT_LAYERS_PLUGIN_PLAYGROUND } from "./LayerList/constants";
import Plugins from "./Plugins";
import usePlugins from "./Plugins/usePlugins";
import SettingsList from "./SettingsList";
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

  const [layers, setLayers] = useState<Layer[]>(
    DEFAULT_LAYERS_PLUGIN_PLAYGROUND
  );

  const [selectedLayerId, setSelectedLayerId] = useState("");
  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);

  const updateInfoboxEnabled = () => {
    const selectedLayerInfoboxEnabled =
      selectedLayer?.infobox?.property?.default?.enabled?.value;
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === selectedLayerId
          ? {
              ...layer,
              infobox: {
                ...layer.infobox,
                property: {
                  ...layer.infobox?.property,
                  default: {
                    ...layer.infobox?.property?.default,
                    enabled: {
                      ...layer.infobox?.property?.default?.enabled,
                      value: !selectedLayerInfoboxEnabled
                    }
                  }
                }
              }
            }
          : layer
      )
    );
  };

  const handleLayerVisibilityUpdate = (layerId: string, visible: boolean) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, visible } : layer
      )
    );
  };

  // Note: currently we put visualizer in tab content, so better not have more tabs in this area,
  // otherwise visualizer will got unmount and mount when switching tabs.
  const MainAreaTabs: TabItem[] = useMemo(
    () => [
      {
        id: "viewer",
        name: "Viewer",
        children: (
          <Viewer
            layers={layers}
            widgets={widgets}
            visualizerRef={visualizerRef}
          />
        )
      }
    ],
    [layers, widgets]
  );

  const LayersPanel: FC = () => (
    <LayerList
      handleLayerVisibilityUpdate={handleLayerVisibilityUpdate}
      layers={layers}
      selectedLayerId={selectedLayerId}
      setSelectedLayerId={setSelectedLayerId}
      visualizerRef={visualizerRef}
    />
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

  const SettingsPanel: FC = () => (
    <SettingsList
      selectedLayer={selectedLayer}
      updateInfoboxEnabled={updateInfoboxEnabled}
    />
  );

  return {
    LayersPanel,
    MainAreaTabs,
    RightAreaTabs,
    SettingsPanel,
    SubRightAreaTabs
  };
};
