import { TabItem } from "@reearth/app/lib/reearth-ui";
import { MapRef } from "@reearth/core";
import { useChangeLanguage, useLang, useT } from "@reearth/services/i18n/hooks";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";

import useCode from "../Code/hook";
import LayerList from "../LayerList";
import { DEFAULT_LAYERS_PLUGIN_PLAYGROUND } from "../LayerList/constants";
import { FileType } from "../Plugins/constants";
import Settings from "../Settings";
import { FieldValue } from "../types";
import { getYmlJson } from "../utils";
import Viewer from "../Viewer";

import useDevPlugin, { getDevPluginUrl } from "./useDevPlugin";

const NO_FILES: FileType[] = [];
const APPLY_DELAY = 400; // ms after the last property edit

const storageKey = (pluginId: string) =>
  `reearth-plugin-playground-dev:${pluginId}`;

function loadFieldValues(pluginId: string): Record<string, FieldValue> {
  try {
    return JSON.parse(localStorage.getItem(storageKey(pluginId)) ?? "{}");
  } catch {
    return {};
  }
}

function saveFieldValues(pluginId: string, values: Record<string, FieldValue>) {
  try {
    localStorage.setItem(storageKey(pluginId), JSON.stringify(values));
  } catch {
    // storage unavailable: values last until reload
  }
}

export default () => {
  const t = useT();
  const lang = useLang();
  const changeLanguage = useChangeLanguage();
  const visualizerRef = useRef<MapRef | null>(null);

  const devPluginUrl = useMemo(getDevPluginUrl, []);
  const { plugin, errors, live, loading, reload } = useDevPlugin(devPluginUrl);
  const files = plugin?.files ?? NO_FILES;

  const extensions = useMemo(() => {
    const yml = files.find((f) => f.title === "reearth.yml");
    const res = yml && getYmlJson(yml);
    return (res?.success && res.data.extensions) || [];
  }, [files]);

  const [enabledVisualizer, setEnabledVisualizer] = useState(true);
  const [showStoryPanel, setShowStoryPanel] = useState(false);
  const [infoboxEnabled, setInfoboxEnabled] = useState(true);

  const resetVisualizer = useCallback(() => {
    setEnabledVisualizer(false);
    const id = setTimeout(() => setEnabledVisualizer(true), 0);
    return () => clearTimeout(id);
  }, []);

  // Property values, edited in the panel and applied after a short pause, since
  // applying them re-runs the plugin like Visualizer does.
  const [fieldValues, setFieldValues] = useState<Record<string, FieldValue>>(
    {}
  );
  const [appliedFieldValues, setAppliedFieldValues] = useState(fieldValues);
  const pluginId = plugin?.id;
  useEffect(() => {
    if (!pluginId) return;
    const values = loadFieldValues(pluginId);
    setFieldValues(values);
    setAppliedFieldValues(values);
  }, [pluginId]);
  useEffect(() => {
    if (!pluginId) return;
    saveFieldValues(pluginId, fieldValues);
    const id = setTimeout(
      () => setAppliedFieldValues(fieldValues),
      APPLY_DELAY
    );
    return () => clearTimeout(id);
  }, [pluginId, fieldValues]);

  // Widgets removed in the widget manager; all are installed at first, like
  // a scene that has just added each of them.
  const [removedWidgetIds, setRemovedWidgetIds] = useState<string[]>([]);
  useEffect(() => setRemovedWidgetIds([]), [pluginId]);
  const widgetExtensions = useMemo(
    () => extensions.filter((e) => e.type === "widget"),
    [extensions]
  );
  const blockExtensions = useMemo(
    () =>
      extensions.filter(
        (e) => e.type === "storyBlock" || e.type === "infoboxBlock"
      ),
    [extensions]
  );
  const installedWidgetIds = useMemo(
    () =>
      widgetExtensions
        .map((e) => e.id)
        .filter((id) => !removedWidgetIds.includes(id)),
    [widgetExtensions, removedWidgetIds]
  );
  // useCode skips extensions without a .js, which drops removed widgets.
  const runFiles = useMemo(
    () =>
      removedWidgetIds.length
        ? files.filter(
            (f) => !removedWidgetIds.some((id) => f.title === `${id}.js`)
          )
        : files,
    [files, removedWidgetIds]
  );

  const { executeCode, infoboxBlocks, story, widgets } = useCode({
    files: runFiles,
    fieldValues: appliedFieldValues,
    resetVisualizer
  });

  // Run the plugin whenever it is (re)loaded or its properties change.
  useEffect(() => {
    if (runFiles.length) executeCode();
  }, [runFiles, executeCode]);

  // Open the story panel the first time a plugin has story blocks.
  const hasStoryBlocks = extensions.some((e) => e.type === "storyBlock");
  useEffect(() => {
    if (hasStoryBlocks) setShowStoryPanel(true);
  }, [hasStoryBlocks]);

  // The extension shown in the inspector: a widget or a block.
  const [selectedId, setSelectedId] = useState<string>();
  const selectedExtension = extensions.find((e) => e.id === selectedId);
  const selectedFile: FileType = useMemo(() => {
    const title = `${selectedExtension?.id ?? ""}.js`;
    return (
      files.find((f) => f.title === title) ?? {
        id: title,
        title,
        sourceCode: ""
      }
    );
  }, [files, selectedExtension?.id]);

  const handleWidgetAdd = useCallback((id: string) => {
    setRemovedWidgetIds((prev) => prev.filter((r) => r !== id));
    setSelectedId(id);
  }, []);
  const handleWidgetRemove = useCallback((id: string) => {
    setRemovedWidgetIds((prev) => [...prev, id]);
    setSelectedId((prev) => (prev === id ? undefined : prev));
  }, []);

  const [selectedLayerId, setSelectedLayerId] = useState("");
  const [visibleLayerIds, setVisibleLayerIds] = useState<string[]>(
    DEFAULT_LAYERS_PLUGIN_PLAYGROUND.filter((l) => l.visible).map((l) => l.id)
  );
  const layerTitles: Record<string, string> = useMemo(
    () => ({
      "chiyoda-3d-tiles": t("Chiyoda 3D Tiles"),
      "japanese-heritage-sites": t("Japanese Heritage Sites")
    }),
    [t]
  );
  const layers = useMemo(
    () =>
      DEFAULT_LAYERS_PLUGIN_PLAYGROUND.map((layer) => ({
        ...layer,
        ...(infoboxEnabled
          ? {
              infobox: {
                id: layer.id,
                blocks: infoboxBlocks,
                property: { default: { enabled: { value: true } } }
              }
            }
          : {}),
        visible: visibleLayerIds.includes(layer.id),
        title: layerTitles[layer.id]
      })),
    [infoboxEnabled, visibleLayerIds, infoboxBlocks, layerTitles]
  );
  const handleLayerVisibilityUpdate = (layerId: string) =>
    setVisibleLayerIds((prev) =>
      prev.includes(layerId)
        ? prev.filter((id) => id !== layerId)
        : [...prev, layerId]
    );

  const MainAreaTabs: TabItem[] = useMemo(
    () => [
      {
        id: "viewer",
        name: t("Viewer"),
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
    [enabledVisualizer, layers, showStoryPanel, story, t, widgets]
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

  const SettingsPanel: FC = () => (
    <Settings
      changeLanguage={changeLanguage}
      lang={lang}
      infoboxEnabled={infoboxEnabled}
      setInfoboxEnabled={setInfoboxEnabled}
      setShowStoryPanel={setShowStoryPanel}
      showStoryPanel={showStoryPanel}
    />
  );

  return {
    LayersPanel,
    MainAreaTabs,
    SettingsPanel,
    devPluginUrl,
    plugin,
    errors,
    live,
    loading,
    reload,
    widgetExtensions,
    blockExtensions,
    installedWidgetIds,
    selectedExtension,
    selectedFile,
    fieldValues,
    setFieldValues,
    setSelectedId,
    handleWidgetAdd,
    handleWidgetRemove
  };
};
