import { Item } from "@reearth/components/atoms/ContentPicker";
import {
  Primitive,
  Widget,
  Block,
  WidgetAlignSystem,
  WidgetZone,
  WidgetSection,
  WidgetArea,
  Alignment,
  WidgetLayoutConstraint,
} from "@reearth/components/molecules/Visualizer";
import {
  GetLayersQuery,
  GetBlocksQuery,
  Maybe,
  MergedPropertyGroupFragmentFragment,
  PropertyItemFragmentFragment,
  MergedPropertyGroupCommonFragmentFragment,
  EarthLayerFragment,
  EarthLayerItemFragment,
  EarthLayer5Fragment,
  GetEarthWidgetsQuery,
  PropertyFragmentFragment,
  WidgetZone as WidgetZoneType,
  WidgetSection as WidgetSectionType,
  WidgetArea as WidgetAreaType,
} from "@reearth/gql";
import { valueFromGQL } from "@reearth/util/value";

type BlockType = Item & {
  pluginId: string;
  extensionId: string;
};

export type Layer = Primitive & {
  layers: Layer[] | undefined;
  isParentVisible: boolean;
};

type P = { [key in string]: any };

const processPropertyGroup = (p?: PropertyItemFragmentFragment | null): P | P[] | undefined => {
  if (!p) return;
  if (p.__typename === "PropertyGroupList") {
    return p.groups
      .map(g => processPropertyGroup(g))
      .filter((g): g is P => !!g && !Array.isArray(g));
  }
  if (p.__typename === "PropertyGroup") {
    return p.fields.reduce<P>(
      (a, b) => ({
        ...a,
        [b.fieldId]: valueFromGQL(b.value, b.type)?.value,
      }),
      p.id ? { id: p.id } : {},
    );
  }
  return;
};

export const convertProperty = (p?: PropertyFragmentFragment | null): P | undefined => {
  if (!p) return;
  const items = "items" in p ? p.items : undefined;
  if (!items) return;

  return Array.isArray(items)
    ? items.reduce<any>(
        (a, b) => ({
          ...a,
          [b.schemaGroupId]: processPropertyGroup(b),
        }),
        {},
      )
    : undefined;
};

const processMergedPropertyGroup = (
  p?: MergedPropertyGroupFragmentFragment | MergedPropertyGroupCommonFragmentFragment | null,
): P | P[] | undefined => {
  if (!p) return;
  if ("groups" in p && p.groups.length) {
    return p.groups
      .map(g => processMergedPropertyGroup(g))
      .filter((g): g is P => !!g && !Array.isArray(g));
  }
  if (!p.fields.length) return;
  return p.fields.reduce<P>(
    (a, b) => ({
      ...a,
      [b.fieldId]: valueFromGQL(b.actualValue, b.type)?.value,
    }),
    {},
  );
};

const processMergedProperty = (
  p?: Maybe<NonNullable<EarthLayerItemFragment["merged"]>["property"]>,
): P | undefined => {
  if (!p) return;
  return p.groups.reduce<any>(
    (a, b) => ({
      ...a,
      [b.schemaGroupId]: processMergedPropertyGroup(b),
    }),
    {},
  );
};

const processInfobox = (infobox?: EarthLayerFragment["infobox"]): Primitive["infobox"] => {
  if (!infobox) return;
  return {
    property: convertProperty(infobox.property),
    blocks: infobox.fields.map<Block>(f => ({
      id: f.id,
      pluginId: f.pluginId,
      extensionId: f.extensionId,
      propertyId: f.propertyId ?? undefined,
      property: convertProperty(f.property),
      pluginProperty: convertProperty(f.scenePlugin?.property),
    })),
  };
};

const processMergedInfobox = (
  infobox?: Maybe<NonNullable<EarthLayerItemFragment["merged"]>["infobox"]>,
): Primitive["infobox"] | undefined => {
  if (!infobox) return;
  return {
    property: processMergedProperty(infobox.property),
    blocks: infobox.fields.map(f => ({
      id: f.originalId,
      pluginId: f.pluginId,
      extensionId: f.extensionId,
      propertyId: f.property?.originalId ?? undefined,
      property: processMergedProperty(f.property),
      pluginProperty: convertProperty(f.scenePlugin?.property),
    })),
  };
};

const processLayer = (layer?: EarthLayer5Fragment, isParentVisible = true): Layer | undefined => {
  return layer
    ? {
        id: layer.id,
        pluginId: layer.pluginId ?? "",
        extensionId: layer.extensionId ?? "",
        isVisible: layer.isVisible,
        title: layer.name,
        property:
          layer.__typename === "LayerItem"
            ? processMergedProperty(layer.merged?.property)
            : undefined,
        pluginProperty: convertProperty(layer.scenePlugin?.property),
        infoboxEditable: !!layer.infobox,
        infobox:
          layer.__typename === "LayerItem"
            ? processMergedInfobox(layer.merged?.infobox)
            : processInfobox(layer.infobox),
        layers:
          layer.__typename === "LayerGroup"
            ? layer.layers
                ?.map(l => processLayer(l ?? undefined, layer.isVisible))
                .filter((l): l is Layer => !!l)
            : undefined,
        isParentVisible,
      }
    : undefined;
};

export const convertWidgets = (
  data: GetEarthWidgetsQuery | undefined,
):
  | {
      floatingWidgets: Widget[];
      alignSystem: WidgetAlignSystem;
      layoutConstraint: { [w in string]: WidgetLayoutConstraint };
    }
  | undefined => {
  if (!data || !data.node || data.node.__typename !== "Scene" || !data.node.widgetAlignSystem) {
    return undefined;
  }

  const layoutConstraint = data.node.widgets.reduce<{
    [w in string]: WidgetLayoutConstraint;
  }>(
    (a, w) =>
      w.extension?.widgetLayout?.extendable
        ? {
            ...a,
            [`${w.pluginId}/${w.extensionId}`]: {
              extendable: {
                horizontally: w.extension?.widgetLayout?.extendable.horizontally,
                vertically: w.extension?.widgetLayout?.extendable.vertically,
              },
            },
          }
        : a,
    {},
  );

  const floatingWidgets = data.node.widgets
    .filter(w => w.enabled && w.extension?.widgetLayout?.floating)
    .map(
      (w): Widget => ({
        id: w.id,
        extended: !!w.extended,
        pluginId: w.pluginId,
        extensionId: w.extensionId,
        property: convertProperty(w.property),
        pluginProperty: convertProperty(w.plugin?.scenePlugin?.property),
      }),
    );

  const widgets = data.node.widgets
    .filter(w => w.enabled && !w.extension?.widgetLayout?.floating)
    .map(
      (w): Widget => ({
        id: w.id,
        extended: !!w.extended,
        pluginId: w.pluginId,
        extensionId: w.extensionId,
        property: convertProperty(w.property),
        pluginProperty: convertProperty(w.plugin?.scenePlugin?.property),
      }),
    );

  const widgetZone = (zone?: Maybe<WidgetZoneType>): WidgetZone => {
    return {
      left: widgetSection(zone?.left),
      center: widgetSection(zone?.center),
      right: widgetSection(zone?.right),
    };
  };

  const widgetSection = (section?: Maybe<WidgetSectionType>): WidgetSection => {
    return {
      top: widgetArea(section?.top),
      middle: widgetArea(section?.middle),
      bottom: widgetArea(section?.bottom),
    };
  };

  const widgetArea = (area?: Maybe<WidgetAreaType>): WidgetArea => {
    const align = area?.align.toLowerCase() as Alignment | undefined;
    return {
      align: align ?? "start",
      widgets: area?.widgetIds
        .map<Widget | undefined>(w => widgets.find(w2 => w === w2.id))
        .filter((w): w is Widget => !!w),
    };
  };

  return {
    floatingWidgets,
    alignSystem: {
      outer: widgetZone(data.node.widgetAlignSystem.outer),
      inner: widgetZone(data.node.widgetAlignSystem.inner),
    },
    layoutConstraint,
  };
};

export const convertLayers = (data: GetLayersQuery | undefined, selectedLayerId?: string) => {
  if (!data || !data.node || data.node.__typename !== "Scene" || !data.node.rootLayer) {
    return undefined;
  }
  const rootLayer = processLayer(data.node.rootLayer);
  const visibleLayers = flattenLayers(rootLayer?.layers);
  const selectedLayer = visibleLayers?.find(l => l.id === selectedLayerId);
  return {
    selectedLayer,
    layers: visibleLayers,
  };
};

const flattenLayers = (l?: Layer[]): Primitive[] => {
  return (
    l?.reduce<Primitive[]>((a, { layers, ...b }) => {
      if (!b || !b.isVisible) {
        return a;
      }
      if (layers?.length) {
        return [...a, { ...b, hiddden: true }, ...flattenLayers(layers)];
      }
      if (!b.pluginId || !b.extensionId) return a;
      return [...a, b];
    }, []) ?? []
  );
};

export const convertToBlocks = (data?: GetBlocksQuery): BlockType[] | undefined => {
  return (data?.node?.__typename === "Scene" ? data.node.plugins : undefined)
    ?.map(plugin =>
      plugin.plugin?.extensions
        ?.filter(e => e && e.type === "BLOCK")
        .map<BlockType | undefined>(extension =>
          plugin.plugin
            ? {
                id: `${plugin.plugin.id}/${extension.extensionId}`,
                icon:
                  extension.icon ||
                  // for official plugin
                  (plugin.plugin.id === "reearth"
                    ? extension.extensionId.replace(/block$/, "")
                    : ""),
                name: extension.name,
                description: extension.description,
                pluginId: plugin.plugin.id,
                extensionId: extension.extensionId,
              }
            : undefined,
        )
        .filter((b): b is BlockType => !!b),
    )
    .filter((a): a is BlockType[] => !!a)
    .reduce((a, b) => [...a, ...b], []);
};
