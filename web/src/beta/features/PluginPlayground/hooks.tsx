import { TabItem } from "@reearth/beta/lib/reearth-ui";
import { MapRef } from "@reearth/core";
import { FC, useCallback, useMemo, useRef, useState } from "react";

import Code from "./Code";
import useCode from "./Code/hook";
import ExtensionSettings from "./ExtensionSettings";
import LayerList from "./LayerList";
import { DEFAULT_LAYERS_PLUGIN_PLAYGROUND } from "./LayerList/constants";
import Plugins from "./Plugins";
import usePlugins from "./Plugins/usePlugins";
import SettingsList from "./SettingsList";
import { FieldValue } from "./types";
import Viewer from "./Viewer";

export default () => {
  const visualizerRef = useRef<MapRef | null>(null);
  const [enabledVisualizer, setEnabledVisualizer] = useState(true);

  // NOTE: This to reset the Visualizer component when selecting a new plugin and triggered when `executeCode` is called.
  const resetVisualizer = useCallback(() => {
    setEnabledVisualizer(false);
    const timeoutId = setTimeout(() => {
      setEnabledVisualizer(true);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const [fieldValues, setFieldValues] = useState<Record<string, FieldValue>>(
    {}
  );

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

  const { executeCode, infoboxBlocks, story, widgets } = useCode({
    files: selectedPlugin.files,
    fieldValues,
    resetVisualizer
  });

  const [infoboxEnabled, setInfoboxEnabled] = useState(true);
  const [selectedLayerId, setSelectedLayerId] = useState("");
  const [showStoryPanel, setShowStoryPanel] = useState(false);
  const [visibleLayerIds, setVisibleLayerIds] = useState<string[]>(
    DEFAULT_LAYERS_PLUGIN_PLAYGROUND.map((l) => l.id)
  );

  const layers = useMemo(() => {
    return DEFAULT_LAYERS_PLUGIN_PLAYGROUND.map((layer) => {
      return {
        ...layer,
        ...(infoboxEnabled
          ? {
              infobox: {
                id: layer.id,
                blocks: infoboxBlocks,
                property: {
                  default: {
                    enabled: {
                      value: true
                    }
                  }
                }
              }
            }
          : {}),
        visible: visibleLayerIds.includes(layer.id)
      };
    });
  }, [infoboxEnabled, visibleLayerIds, infoboxBlocks]);

  const handleLayerVisibilityUpdate = (layerId: string) => {
    setVisibleLayerIds((prev) =>
      prev.includes(layerId)
        ? prev.filter((id) => id !== layerId)
        : [...prev, layerId]
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
            enabledVisualizer={enabledVisualizer}
            layers={layers}
            story={story}
            showStoryPanel={showStoryPanel}
            visualizerRef={visualizerRef}
            widgets={widgets}
          />
        )
      }
    ],
    [enabledVisualizer, layers, showStoryPanel, story, widgets]
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
      infoboxEnabled={infoboxEnabled}
      setInfoboxEnabled={setInfoboxEnabled}
      setShowStoryPanel={setShowStoryPanel}
      showStoryPanel={showStoryPanel}
    />
  );

  const ExtensionSettingsPanel: FC = () => (
    <ExtensionSettings
      selectedPlugin={selectedPlugin}
      selectedFile={selectedFile}
      fieldValues={fieldValues}
      setFieldValues={setFieldValues}
    />
  );

  return {
    LayersPanel,
    MainAreaTabs,
    RightAreaTabs,
    SettingsPanel,
    SubRightAreaTabs,
    ExtensionSettingsPanel
  };
};
