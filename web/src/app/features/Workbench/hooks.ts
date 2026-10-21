import type { ViewerProperty } from "@reearth/app/features/Editor/Visualizer/type";
import { hiddenExtensionKey } from "@reearth/app/features/Visualizer/Crust/hiddenExtensionKey";
import type {
  Camera,
  MapRef
} from "@reearth/app/features/Visualizer/Crust/types";
import { useChangeLanguage, useLang } from "@reearth/services/i18n/hooks";
import {
  useDevPluginExtensionRenderKey,
  useDevPluginExtensions
} from "@reearth/services/state/devPlugins";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { buildBlocks, buildLayers, buildStory, buildWidgets } from "./build";
import { DEFAULT_WORKBENCH_LAYERS, INFOBOX_LAYER_ID } from "./constants";
import {
  clearStoredValues,
  hasStoredValues as hasStored,
  setFieldValue
} from "./properties";
import { loadJson, saveJson } from "./storage";
import type { FieldValue, FieldValues, PluginExtension } from "./types";
import useDevPlugin, { getDevPluginUrl } from "./useDevPlugin";

const NO_EXTENSIONS: PluginExtension[] = [];
const SIDEBAR_KEY = "sidebar";

export default () => {
  const visualizerRef = useRef<MapRef>(null);
  const [currentCamera, setCurrentCamera] = useState<Camera | undefined>();
  const lang = useLang();
  const changeLanguage = useChangeLanguage();

  const devPluginUrl = useMemo(getDevPluginUrl, []);
  const {
    manifest,
    error,
    extensionErrors,
    live,
    loading,
    loadedAt,
    loadRevision,
    reload
  } = useDevPlugin(devPluginUrl);
  const pluginId = manifest?.id;
  const extensions = manifest?.extensions ?? NO_EXTENSIONS;

  // Visualizer fetches each extension's .js from the URL it is given here.
  // The load time keeps URLs fresh across page visits, and the revision also
  // distinguishes reloads within one millisecond. The render key restarts
  // Zushi even when a manual reload fetches identical code.
  const [, setDevPluginExtensions] = useDevPluginExtensions();
  const [, updateDevPluginExtensionRenderKey] =
    useDevPluginExtensionRenderKey();
  useEffect(() => {
    if (!devPluginUrl || !manifest || !loadedAt || !loadRevision) return;
    setDevPluginExtensions(
      extensions.map((e) => ({
        id: e.id,
        url: `${devPluginUrl}/${e.id}.js?v=${loadedAt.getTime()}-${loadRevision}`
      }))
    );
    updateDevPluginExtensionRenderKey((previous) => previous + 1);
  }, [
    devPluginUrl,
    manifest,
    extensions,
    loadedAt,
    loadRevision,
    setDevPluginExtensions,
    updateDevPluginExtensionRenderKey
  ]);

  // Property values, edited in the inspector and kept per plugin.
  const [fieldValues, setFieldValues] = useState<FieldValues>({});
  const valuesLoadedFor = useRef<string>(undefined);
  useEffect(() => {
    if (!pluginId) return;
    setFieldValues(loadJson<FieldValues>(`values:${pluginId}`, {}));
    valuesLoadedFor.current = pluginId;
  }, [pluginId]);
  useEffect(() => {
    // Wait until the stored values are in, or they would be overwritten.
    if (!pluginId || valuesLoadedFor.current !== pluginId) return;
    saveJson(`values:${pluginId}`, fieldValues);
  }, [pluginId, fieldValues]);
  const updateFieldValue = useCallback(
    (key: string, value: FieldValue) =>
      setFieldValues((prev) => setFieldValue(prev, key, value)),
    []
  );

  // Widgets and blocks hidden with their eye toggle. Individual hidden
  // extensions stay mounted while their parent panel remains visible.
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  useEffect(() => setHiddenIds([]), [pluginId]);
  const toggleHidden = useCallback((id: string) => {
    setHiddenIds((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  }, []);
  const hiddenKeys = useMemo(
    () => hiddenIds.map((id) => hiddenExtensionKey(pluginId, id)),
    [hiddenIds, pluginId]
  );

  const widgets = useMemo(
    () => buildWidgets(pluginId ?? "", extensions, fieldValues),
    [pluginId, extensions, fieldValues]
  );
  const infoboxBlocks = useMemo(
    () => buildBlocks(pluginId ?? "", extensions, "infoboxBlock", fieldValues),
    [pluginId, extensions, fieldValues]
  );
  const story = useMemo(
    () => buildStory(pluginId ?? "", extensions, fieldValues),
    [pluginId, extensions, fieldValues]
  );

  // The extension in the inspector; the first one when nothing is selected.
  const [selectedId, setSelectedId] = useState<string>();
  useEffect(() => {
    if (!extensions.some((e) => e.id === selectedId)) {
      setSelectedId(extensions[0]?.id);
    }
  }, [extensions, selectedId]);
  const selectedExtension = extensions.find((e) => e.id === selectedId);

  const resetFieldValues = useCallback(
    (extension: PluginExtension) => {
      if (!pluginId) return;
      setFieldValues((prev) => clearStoredValues(extension, pluginId, prev));
    },
    [pluginId]
  );
  const hasFieldValues = useCallback(
    (extension: PluginExtension) =>
      !!pluginId && hasStored(extension, pluginId, fieldValues),
    [pluginId, fieldValues]
  );

  const [visibleLayerIds, setVisibleLayerIds] = useState<string[]>(
    DEFAULT_WORKBENCH_LAYERS.filter((l) => l.visible).map((l) => l.id)
  );
  const layers = useMemo(
    () => buildLayers(infoboxBlocks, visibleLayerIds),
    [infoboxBlocks, visibleLayerIds]
  );
  const toggleLayer = useCallback(
    (layerId: string) =>
      setVisibleLayerIds((prev) =>
        prev.includes(layerId)
          ? prev.filter((id) => id !== layerId)
          : [...prev, layerId]
      ),
    []
  );
  const flyToLayer = useCallback(
    (layerId: string) => {
      if (visibleLayerIds.includes(layerId)) {
        visualizerRef.current?.engine.flyTo?.(layerId, { duration: 0 });
      }
    },
    [visibleLayerIds]
  );

  // The infobox is open while a layer is selected (the API reports no feature
  // for a selection it makes): by a click on the map, or from the inspector,
  // which opens it on the first feature.
  const [infoboxOpen, setInfoboxOpen] = useState(false);
  const handleLayerSelect = useCallback(
    (layerId: string | undefined) => setInfoboxOpen(!!layerId),
    []
  );
  const openInfobox = useCallback(() => {
    setVisibleLayerIds((prev) =>
      prev.includes(INFOBOX_LAYER_ID) ? prev : [...prev, INFOBOX_LAYER_ID]
    );
    // A layer just turned on has no features until it loads.
    const select = (tries: number) => {
      const map = visualizerRef.current?.layers;
      const featureId =
        map?.findById?.(INFOBOX_LAYER_ID)?.computed?.features?.[0]?.id;
      if (featureId) {
        map?.selectFeature?.(INFOBOX_LAYER_ID, featureId);
        setInfoboxOpen(true);
      } else if (tries > 0) {
        setTimeout(() => select(tries - 1), 200);
      }
    };
    select(15);
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(() =>
    loadJson<boolean>(SIDEBAR_KEY, true)
  );
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => {
      saveJson(SIDEBAR_KEY, !prev);
      return !prev;
    });
  }, []);

  const [mapLoading, setMapLoading] = useState(true);
  const handleMapMount = useCallback(() => setMapLoading(false), []);

  const engineMeta = useMemo(() => ({ cesiumIonAccessToken: undefined }), []);
  const viewerProperty: ViewerProperty = useMemo(
    () => ({ tiles: [{ id: "default", type: "open_street_map" }] }),
    []
  );

  // Follow the visibility of story blocks, including when the last one is hidden.
  const showStoryPanel = extensions.some(
    (extension) =>
      extension.type === "storyBlock" && !hiddenIds.includes(extension.id)
  );

  return {
    changeLanguage,
    currentCamera,
    devPluginUrl,
    engineMeta,
    error,
    extensionErrors,
    extensions,
    fieldValues,
    flyToLayer,
    handleLayerSelect,
    handleMapMount,
    hasFieldValues,
    hiddenIds,
    hiddenKeys,
    infoboxOpen,
    lang,
    layers,
    live,
    loadedAt,
    loading,
    manifest,
    mapLoading,
    openInfobox,
    reload,
    resetFieldValues,
    selectedExtension,
    setCurrentCamera,
    setSelectedId,
    showStoryPanel,
    sidebarOpen,
    story,
    toggleHidden,
    toggleLayer,
    toggleSidebar,
    updateFieldValue,
    setFieldValues,
    viewerProperty,
    visualizerRef,
    widgets
  };
};
