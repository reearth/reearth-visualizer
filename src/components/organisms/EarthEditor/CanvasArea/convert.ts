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
} from "@reearth/gql";
import { valueFromGQL } from "@reearth/util/value";

import { Item } from "@reearth/components/atoms/ContentPicker";
import { EarthWidget } from "@reearth/components/molecules/EarthEditor/Earth";

type I = Item & {
  pluginId: string;
  extensionId: string;
};

export type Property = { [key in string]: any };

export interface LayerInfoboxField {
  id: string;
  pluginId: string;
  extensionId: string;
  propertyId?: string;
  property?: Property;
}

export interface LayerInfoBox {
  property?: Property;
  fields?: LayerInfoboxField[];
}

export interface Layer {
  id: string;
  pluginId: string;
  extensionId: string;
  property: Property | undefined;
  pluginProperty: Property | undefined;
  infobox: LayerInfoBox | undefined;
  layers: Layer[] | undefined;
  isVisible: boolean;
  title: string;
  infoboxEditable: boolean;
  isParentVisible: boolean;
}

const flattenLayers = (l?: Layer[]): Layer[] | undefined => {
  return l?.reduce<Layer[]>((a, b) => {
    if (!b) {
      return a;
    }
    if (b.layers) {
      return [...a, b, ...(flattenLayers(b.layers) ?? [])];
    }
    return [...a, b];
  }, []);
};

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

type P = { [key in string]: any };

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

const processInfobox = (infobox?: EarthLayerFragment["infobox"]): LayerInfoBox | undefined => {
  if (!infobox) return;
  return {
    property: convertProperty(infobox.property),
    fields: infobox.fields.map(f => ({
      id: f.id,
      pluginId: f.pluginId,
      extensionId: f.extensionId,
      propertyId: f.propertyId ?? undefined,
      property: convertProperty(f.property),
    })),
  };
};

const processMergedInfobox = (
  infobox?: Maybe<NonNullable<EarthLayerItemFragment["merged"]>["infobox"]>,
): LayerInfoBox | undefined => {
  if (!infobox) return;
  return {
    property: processMergedProperty(infobox.property),
    fields: infobox.fields.map(f => ({
      id: f.originalId,
      pluginId: f.pluginId,
      extensionId: f.extensionId,
      propertyId: f.property?.originalId ?? undefined,
      property: processMergedProperty(f.property),
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
        pluginProperty: {},
        // pluginProperty:
        //   "plugin" in layer ? processProperty(layer.plugin?.scenePlugin?.property) : undefined,
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

export const convertWidgets = (data: GetEarthWidgetsQuery | undefined) => {
  if (!data || !data.node || data.node.__typename !== "Scene") {
    return undefined;
  }

  const widgets = data.node.widgets.map(
    (widget): EarthWidget => ({
      pluginId: widget.pluginId,
      extensionId: widget.extensionId,
      property: convertProperty(widget.property),
      pluginProperty: convertProperty(widget.plugin?.scenePlugin?.property),
      enabled: widget.enabled,
    }),
  );

  return widgets;
};

export const convertLayers = (data: GetLayersQuery | undefined, selectedLayerId?: string) => {
  if (!data || !data.node || data.node.__typename !== "Scene" || !data.node.rootLayer) {
    return undefined;
  }
  const rootLayer = processLayer(data.node.rootLayer);
  const allLayers = flattenLayers(rootLayer?.layers);
  const visibleLayers = allLayers
    ?.filter(
      (l): l is Layer =>
        !!l && l.isParentVisible && !l.layers && !!l.pluginId && !!l.extensionId && l.isVisible,
    )
    .reverse();
  const selectedLayer = allLayers?.find(l => l.id === selectedLayerId);

  return {
    selectedLayer,
    layers: visibleLayers,
  };
};

export const convertToBlocks = (data?: GetBlocksQuery): I[] | undefined => {
  return (data?.node?.__typename === "Scene" ? data.node.plugins : undefined)
    ?.map(plugin =>
      plugin.plugin?.extensions
        ?.filter(e => e && e.type === "BLOCK")
        .map<I | undefined>(extension =>
          plugin.plugin
            ? {
                id: `${plugin.plugin.id}_${extension.extensionId}`,
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
        .filter((b): b is I => !!b),
    )
    .filter((a): a is I[] => !!a)
    .reduce((a, b) => [...a, ...b], []);
};
