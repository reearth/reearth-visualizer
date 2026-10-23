import { MapRef } from "@reearth/core";
import { useChangeLanguage, useLang, useT } from "@reearth/services/i18n/hooks";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import useCode from "../Code/hook";
import { DEFAULT_LAYERS_PLUGIN_PLAYGROUND } from "../LayerList/constants";
import { FileType } from "../Plugins/constants";
import { FieldValue, ReearthYML, Widgets } from "../types";
import { getYmlJson } from "../utils";

import useDevPlugin, { getDevPluginUrl } from "./useDevPlugin";

export type Extension = NonNullable<ReearthYML["extensions"]>[number];

const NO_FILES: FileType[] = [];
const APPLY_DELAY = 400; // ms after the last property edit
// The layer with features to click, so that infobox blocks can be seen.
const INFOBOX_LAYER_ID = "japanese-heritage-sites";
const SIDEBAR_KEY = "reearth-plugin-playground-dev:sidebar";

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

function loadSidebarOpen() {
  try {
    return localStorage.getItem(SIDEBAR_KEY) !== "0";
  } catch {
    return true;
  }
}

const ZONES = ["outer", "inner"] as const;
const SECTIONS = ["left", "center", "right"] as const;
const AREAS = ["top", "middle", "bottom"] as const;

/** Takes hidden widgets off the map without touching the others. */
function withoutWidgets(widgets: Widgets, extensionIds: string[]): Widgets {
  if (!widgets?.alignSystem || !extensionIds.length) return widgets;
  const alignSystem = { ...widgets.alignSystem };
  for (const zone of ZONES) {
    const z = alignSystem[zone];
    if (!z) continue;
    const nextZone = { ...z };
    for (const section of SECTIONS) {
      const s = nextZone[section];
      if (!s) continue;
      const nextSection = { ...s };
      for (const area of AREAS) {
        const a = nextSection[area];
        if (!a?.widgets) continue;
        nextSection[area] = {
          ...a,
          widgets: a.widgets.filter(
            (w) => !w.extensionId || !extensionIds.includes(w.extensionId)
          )
        };
      }
      nextZone[section] = nextSection;
    }
    alignSystem[zone] = nextZone;
  }
  return { ...widgets, alignSystem };
}

export default () => {
  const t = useT();
  const lang = useLang();
  const changeLanguage = useChangeLanguage();
  const visualizerRef = useRef<MapRef | null>(null);

  const devPluginUrl = useMemo(getDevPluginUrl, []);
  const { plugin, error, extensionErrors, live, loading, loadedAt, reload } =
    useDevPlugin(devPluginUrl);
  const files = plugin?.files ?? NO_FILES;

  const manifest = useMemo(() => {
    const yml = files.find((f) => f.title === "reearth.yml");
    const res = yml && getYmlJson(yml);
    return res?.success ? res.data : undefined;
  }, [files]);
  const extensions: Extension[] = useMemo(
    () => manifest?.extensions ?? [],
    [manifest]
  );

  // The map is remounted when the plugin's code changes; until it mounts
  // again it's blank, so a loading state covers it.
  const [enabledVisualizer, setEnabledVisualizer] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);

  const resetVisualizer = useCallback(() => {
    setEnabledVisualizer(false);
    setMapLoading(true);
    const id = setTimeout(() => setEnabledVisualizer(true), 0);
    return () => clearTimeout(id);
  }, []);
  const handleMapMount = useCallback(() => setMapLoading(false), []);

  // Property values, edited in the inspector and applied after a short pause,
  // since applying them reruns the plugin like Visualizer does.
  const [fieldValues, setFieldValues] = useState<Record<string, FieldValue>>(
    {}
  );
  const [appliedFieldValues, setAppliedFieldValues] = useState(fieldValues);
  const pluginId = plugin?.id;
  // The plugin whose stored values are loaded; it runs only after that, since
  // a run that is replaced while starting can leave its layers on the map.
  const [valuesLoadedFor, setValuesLoadedFor] = useState<string>();
  useEffect(() => {
    if (!pluginId) return;
    const values = loadFieldValues(pluginId);
    setFieldValues(values);
    setAppliedFieldValues(values);
    setValuesLoadedFor(pluginId);
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

  const { executeCode, infoboxBlocks, story, widgets } = useCode({
    files,
    fieldValues: appliedFieldValues,
    resetVisualizer,
    visualizerRef
  });

  // Run the plugin whenever it is (re)loaded or its properties change.
  useEffect(() => {
    if (files.length && valuesLoadedFor === pluginId) executeCode();
  }, [files, executeCode, valuesLoadedFor, pluginId]);

  // Widgets and blocks hidden with their eye toggle; all are shown at first.
  // Hiding one takes it off the map, out of the story panel or out of the
  // infobox, without running the others again.
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  useEffect(() => setHiddenIds([]), [pluginId]);
  const toggleHidden = useCallback((id: string) => {
    setHiddenIds((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  }, []);
  const shownWidgets = useMemo(
    () => withoutWidgets(widgets, hiddenIds),
    [widgets, hiddenIds]
  );
  const shownStory = useMemo(
    () =>
      story && {
        ...story,
        pages: story.pages.map((page) => ({
          ...page,
          blocks: page.blocks.filter((b) => !hiddenIds.includes(b.extensionId))
        }))
      },
    [story, hiddenIds]
  );
  const shownInfoboxBlocks = useMemo(
    () => infoboxBlocks?.filter((b) => !hiddenIds.includes(b.extensionId)),
    [infoboxBlocks, hiddenIds]
  );

  // The story panel shows while any story block does.
  const showStoryPanel = extensions.some(
    (e) => e.type === "storyBlock" && !hiddenIds.includes(e.id)
  );
  const hasInfoboxBlocks = extensions.some((e) => e.type === "infoboxBlock");

  // The extension in the inspector. The first one is picked when nothing is,
  // so the inspector always shows something.
  const [selectedId, setSelectedId] = useState<string>();
  useEffect(() => {
    if (!extensions.some((e) => e.id === selectedId)) {
      setSelectedId(extensions[0]?.id);
    }
  }, [extensions, selectedId]);
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

  // Clears the values stored for one extension, so its defaults apply again.
  const resetFieldValues = useCallback(
    (extension: Extension) => {
      if (!pluginId) return;
      const prefixes = (extension.schema?.groups ?? []).map(
        (g) => `${pluginId}-${extension.id}-${g.id}-`
      );
      setFieldValues((prev) =>
        Object.fromEntries(
          Object.entries(prev).filter(
            ([key]) => !prefixes.some((p) => key.startsWith(p))
          )
        )
      );
    },
    [pluginId]
  );
  const hasFieldValues = useCallback(
    (extension: Extension) =>
      !!pluginId &&
      (extension.schema?.groups ?? []).some((g) =>
        Object.keys(fieldValues).some((key) =>
          key.startsWith(`${pluginId}-${extension.id}-${g.id}-`)
        )
      ),
    [pluginId, fieldValues]
  );

  const [visibleLayerIds, setVisibleLayerIds] = useState<string[]>(
    DEFAULT_LAYERS_PLUGIN_PLAYGROUND.filter((l) => l.visible).map((l) => l.id)
  );
  // Infobox blocks show when a feature is clicked, so turn on a layer with
  // features once for a plugin that has them.
  const infoboxLayerShownFor = useRef<string>(undefined);
  useEffect(() => {
    if (!pluginId || !hasInfoboxBlocks) return;
    if (infoboxLayerShownFor.current === pluginId) return;
    infoboxLayerShownFor.current = pluginId;
    setVisibleLayerIds((prev) =>
      prev.includes(INFOBOX_LAYER_ID) ? prev : [...prev, INFOBOX_LAYER_ID]
    );
  }, [pluginId, hasInfoboxBlocks]);

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
        infobox: {
          id: layer.id,
          blocks: shownInfoboxBlocks,
          property: { default: { enabled: { value: true } } }
        },
        visible: visibleLayerIds.includes(layer.id),
        title: layerTitles[layer.id]
      })),
    [visibleLayerIds, shownInfoboxBlocks, layerTitles]
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

  // The infobox is open while a feature is selected: by a click on the map, or
  // from the inspector, which opens it on the first heritage site.
  const [infoboxOpen, setInfoboxOpen] = useState(false);
  const handleLayerSelect = useCallback(
    (layerId: string | undefined, _layer: unknown, feature: unknown) =>
      setInfoboxOpen(!!layerId && !!feature),
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

  const [sidebarOpen, setSidebarOpen] = useState(loadSidebarOpen);
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => {
      try {
        localStorage.setItem(SIDEBAR_KEY, prev ? "0" : "1");
      } catch {
        // storage unavailable: the choice lasts until reload
      }
      return !prev;
    });
  }, []);

  return {
    visualizerRef,
    devPluginUrl,
    plugin,
    manifest,
    error,
    extensionErrors,
    live,
    loading,
    loadedAt,
    reload,
    extensions,
    hiddenIds,
    toggleHidden,
    selectedExtension,
    selectedFile,
    setSelectedId,
    fieldValues,
    setFieldValues,
    resetFieldValues,
    hasFieldValues,
    enabledVisualizer,
    mapLoading,
    handleMapMount,
    layers,
    toggleLayer,
    flyToLayer,
    story: shownStory,
    widgets: shownWidgets,
    showStoryPanel,
    infoboxOpen,
    openInfobox,
    handleLayerSelect,
    lang,
    changeLanguage,
    sidebarOpen,
    toggleSidebar
  };
};
