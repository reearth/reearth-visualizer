import type { Layer } from "@reearth/core";

import { DEFAULT_WORKBENCH_LAYERS } from "./constants";
import { generateProperty } from "./properties";
import type {
  FieldValues,
  PluginExtension,
  WorkbenchBlock,
  WorkbenchStory,
  WorkbenchWidgets
} from "./types";

/**
 * Places each widget in its default area. Widgets are appended, never merged
 * with others, so two widgets in one area both stay.
 */
export const buildWidgets = (
  pluginId: string,
  extensions: PluginExtension[],
  values: FieldValues
): NonNullable<WorkbenchWidgets> =>
  extensions.reduce<NonNullable<WorkbenchWidgets>>(
    (prv, cur) => {
      if (cur.type !== "widget") return prv;
      const {
        zone = "outer",
        section = "left",
        area = "top"
      } = cur.widgetLayout?.defaultLocation ?? {};
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
                    property: generateProperty(cur, pluginId, values),
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

export const buildBlocks = (
  pluginId: string,
  extensions: PluginExtension[],
  type: "infoboxBlock" | "storyBlock",
  values: FieldValues
) =>
  extensions
    .filter((e) => e.type === type)
    .map<WorkbenchBlock & { extensionType: typeof type }>((e) => {
      const property = generateProperty(e, pluginId, values);
      return {
        id: `${pluginId}-${e.id}`,
        name: e.name ?? e.id,
        description: e.description,
        extensionId: e.id,
        pluginId,
        extensionType: type,
        property,
        propertyForPluginAPI: property
      };
    });

export const buildLayers = (
  infoboxBlocks: WorkbenchBlock[],
  visibleLayerIds: string[]
): Layer[] =>
  DEFAULT_WORKBENCH_LAYERS.map((layer) => ({
    ...layer,
    visible: visibleLayerIds.includes(layer.id),
    ...(infoboxBlocks.length > 0
      ? {
          infobox: {
            id: layer.id,
            blocks: infoboxBlocks,
            property: { default: { enabled: { value: true } } }
          }
        }
      : {})
  })) as Layer[];

export const buildStory = (
  pluginId: string,
  extensions: PluginExtension[],
  values: FieldValues
): WorkbenchStory | undefined => {
  const blocks = buildBlocks(pluginId, extensions, "storyBlock", values);
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
