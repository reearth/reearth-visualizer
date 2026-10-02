import type { ViewerProperty } from "@reearth/app/features/Editor/Visualizer/type";
import type { Camera, MapRef } from "@reearth/app/features/Visualizer/Crust/types";
import type { Layer } from "@reearth/core";
import { useDevPluginExtensions } from "@reearth/services/state/devPlugins";
import * as yaml from "js-yaml";
import { useEffect, useMemo, useRef, useState } from "react";

import { DEFAULT_WORKBENCH_LAYERS } from "./constants";
import type {
  PluginExtension,
  ReearthYML,
  WorkbenchBlock,
  WorkbenchStory,
  WorkbenchWidgets
} from "./types";

const isLocalhost = (hostname: string) =>
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "::1" ||
  hostname === "[::1]";

const buildWidgets = (
  pluginId: string,
  extensions: PluginExtension[]
): NonNullable<WorkbenchWidgets> =>
  extensions.reduce<NonNullable<WorkbenchWidgets>>(
    (prv, cur) => {
      if (cur.type !== "widget") return prv;
      const { zone = "outer", section = "left", area = "top" } =
        cur.widgetLayout?.defaultLocation ?? {};
      const zoneAlignSystem = prv.alignSystem?.[zone] ?? {};
      const sectionAlignSystem = zoneAlignSystem[section] ?? {};
      const areaAlignSystem = sectionAlignSystem[area] ?? { widgets: [] };
      return {
        ...prv,
        alignSystem: {
          ...prv.alignSystem,
          [zone]: {
            ...zoneAlignSystem,
            [section]: {
              ...sectionAlignSystem,
              [area]: {
                ...areaAlignSystem,
                widgets: [
                  ...(areaAlignSystem.widgets ?? []),
                  {
                    id: `${pluginId}-${cur.id}`,
                    name: cur.name,
                    extensionId: cur.id,
                    pluginId,
                    property: {},
                    extended: cur.widgetLayout?.extended ?? false
                  }
                ]
              }
            }
          }
        }
      };
    },
    { alignSystem: {}, floating: [], ownBuiltinWidgets: [] }
  );

const buildBlocks = (
  pluginId: string,
  extensions: PluginExtension[],
  type: "infoboxBlock" | "storyBlock"
) =>
  extensions
    .filter((e) => e.type === type)
    .map<WorkbenchBlock & { extensionType: typeof type }>((e) => ({
      id: `${pluginId}-${e.id}`,
      name: e.name ?? e.id,
      description: e.description,
      extensionId: e.id,
      pluginId,
      extensionType: type,
      property: {},
      propertyForPluginAPI: {}
    }));

const buildLayers = (infoboxBlocks: WorkbenchBlock[]): Layer[] =>
  DEFAULT_WORKBENCH_LAYERS.map((layer) =>
    infoboxBlocks.length > 0
      ? {
          ...layer,
          infobox: {
            id: layer.id,
            blocks: infoboxBlocks,
            property: { default: { enabled: { value: true } } }
          }
        }
      : layer
  ) as Layer[];

const buildStory = (
  pluginId: string,
  extensions: PluginExtension[]
): WorkbenchStory | undefined => {
  const blocks = buildBlocks(pluginId, extensions, "storyBlock");
  if (blocks.length === 0) return undefined;
  return {
    id: "story",
    title: "Story",
    position: "left",
    bgColor: "#f0f0f0",
    pages: [
      {
        id: "page",
        blocks,
        layerIds: DEFAULT_WORKBENCH_LAYERS.map((l) => l.id)
      }
    ]
  } as WorkbenchStory;
};

export default () => {
  const visualizerRef = useRef<MapRef>(null);
  const [ready, setReady] = useState(false);
  const [currentCamera, setCurrentCamera] = useState<Camera | undefined>();
  const [manifest, setManifest] = useState<ReearthYML | undefined>();
  const [, setDevPluginExtensions] = useDevPluginExtensions();

  useEffect(() => {
    const devPluginUrl = new URLSearchParams(window.location.search).get(
      "dev-plugin"
    );
    if (!devPluginUrl) return;

    let url: URL;
    try {
      url = new URL(devPluginUrl);
    } catch {
      return;
    }
    if (!isLocalhost(url.hostname)) return;

    const load = async () => {
      try {
        const response = await fetch(`${devPluginUrl}/reearth.yml`);
        if (!response.ok) return;
        const data = yaml.load(await response.text()) as ReearthYML;
        setManifest(data);
        const extensions =
          data.extensions?.map((e) => ({
            id: e.id,
            url: `${devPluginUrl}/${e.id}.js`
          })) ?? [];
        if (extensions.length > 0) setDevPluginExtensions(extensions);
      } catch {
        // Ignore load failures; the viewer still renders with default layers.
      }
    };
    void load();
  }, [setDevPluginExtensions]);

  const extensions = useMemo(() => manifest?.extensions ?? [], [manifest]);

  const widgets = useMemo(
    () => buildWidgets(manifest?.id ?? "", extensions),
    [manifest, extensions]
  );

  const infoboxBlocks = useMemo(
    () => buildBlocks(manifest?.id ?? "", extensions, "infoboxBlock"),
    [manifest, extensions]
  );

  const story = useMemo(
    () => buildStory(manifest?.id ?? "", extensions),
    [manifest, extensions]
  );

  const layers = useMemo(() => buildLayers(infoboxBlocks), [infoboxBlocks]);

  const engineMeta = useMemo(
    () => ({
      cesiumIonAccessToken: undefined
    }),
    []
  );

  const viewerProperty: ViewerProperty = useMemo(
    () => ({
      tiles: [
        {
          id: "default",
          type: "open_street_map"
        }
      ]
    }),
    []
  );

  useEffect(() => {
    setReady(true);
  }, []);

  return {
    currentCamera,
    engineMeta,
    layers,
    ready,
    setCurrentCamera,
    showStoryPanel: !!story,
    story,
    viewerProperty,
    visualizerRef,
    widgets
  };
};
