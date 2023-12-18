import { Item } from "@reearth/classic/components/atoms/ContentPicker";
import {
  Layer,
  Widget,
  Block,
  WidgetAlignSystem,
  WidgetZone,
  WidgetSection,
  WidgetArea,
  Alignment,
  WidgetLayoutConstraint,
  Tag,
} from "@reearth/classic/components/molecules/Visualizer";
import {
  BuiltinWidgets,
  isBuiltinWidget,
} from "@reearth/classic/components/molecules/Visualizer/Widget/builtin";
import { WidgetAreaPadding } from "@reearth/classic/components/molecules/Visualizer/WidgetAlignSystem/hooks";
import {
  GetBlocksQuery,
  Maybe,
  PropertyItemFragmentFragment,
  EarthLayerFragment,
  GetEarthWidgetsQuery,
  PropertyFragmentFragment,
  WidgetZone as WidgetZoneType,
  WidgetSection as WidgetSectionType,
  WidgetArea as WidgetAreaType,
  EarthLayerCommonFragment,
  EarthLayerItemFragment,
  PropertySchemaGroupFragmentFragment,
} from "@reearth/classic/gql";
import { valueFromGQL } from "@reearth/classic/util/value";

type PropertyGroupFragmentFragment = Extract<
  PropertyItemFragmentFragment,
  { __typename?: "PropertyGroup" }
>;
type PropertySchemaFieldFragmentFragment = PropertySchemaGroupFragmentFragment["fields"][number];
type PropertyFieldFragmentFragment = PropertyGroupFragmentFragment["fields"][number];

export type { Layer } from "@reearth/classic/components/molecules/Visualizer";

export type RawLayer = EarthLayerCommonFragment &
  (
    | EarthLayerItemFragment
    | {
        __typename: "LayerGroup";
        layers?: RawLayer[] | null | undefined;
      }
  );

type BlockType = Item & {
  pluginId: string;
  extensionId: string;
};

type P = { [key in string]: any };

export type DatasetMap = Record<string, Datasets>;

export type Datasets = {
  // JSON schema
  schema: {
    $schema: string;
    $id: string;
    properties: Record<
      string,
      {
        $id: string;
      }
    >;
  };
  datasets: Record<string, any>[];
};

export const extractDatasetSchemas = (layer: RawLayer | null | undefined): string[] => {
  const datasetSchemaIds = new Set<string>();

  const extract = (layer: RawLayer | null | undefined) => {
    if (layer?.__typename !== "LayerGroup") return;
    if (layer.linkedDatasetSchemaId) {
      datasetSchemaIds.add(layer.linkedDatasetSchemaId);
    }
    layer.layers?.forEach(extract);
  };

  extract(layer);

  return Array.from(datasetSchemaIds);
};

export const processLayer = (
  layer: RawLayer | null | undefined,
  parent: RawLayer | null | undefined,
  datasets: DatasetMap | null | undefined,
): Layer | undefined => {
  if (!layer) return;
  const isDatasetLayer = layer.__typename === "LayerGroup" && !!layer.linkedDatasetSchemaId;
  return {
    id: layer.id,
    pluginId: layer.pluginId ?? "",
    extensionId: layer.extensionId ?? "",
    isVisible: layer.isVisible,
    title: layer.name,
    tags: processLayerTags(layer.tags),
    propertyId: layer.propertyId ?? undefined,
    ...(!isDatasetLayer
      ? {
          property: processProperty(
            parent?.property,
            layer.property,
            layer.__typename === "LayerItem" ? layer.linkedDatasetId : undefined,
            datasets,
          ),
        }
      : {}),
    ...(layer.infobox || parent?.infobox
      ? {
          infobox: processInfobox(
            layer.infobox,
            parent?.infobox,
            layer.__typename === "LayerItem" ? layer.linkedDatasetId : undefined,
            datasets,
          ),
        }
      : {}),
    ...(layer.__typename === "LayerGroup"
      ? {
          children: layer.layers
            ?.map(l => processLayer(l as RawLayer, isDatasetLayer ? layer : undefined, datasets))
            .filter((l): l is Layer => !!l),
        }
      : {}),
  };
};

export const processProperty = (
  parent: PropertyFragmentFragment | null | undefined,
  orig?: PropertyFragmentFragment | null | undefined,
  linkedDatasetId?: string | null | undefined,
  datasets?: DatasetMap | null | undefined,
): P | undefined => {
  const schema = orig?.schema || parent?.schema;
  if (!schema) return;

  const allItems: Record<
    string,
    {
      schema: PropertySchemaGroupFragmentFragment;
      orig?: PropertyItemFragmentFragment;
      parent?: PropertyItemFragmentFragment;
    }
  > = schema.groups.reduce(
    (a, b) => ({
      ...a,
      [b.schemaGroupId]: {
        schema: b,
        orig: orig?.items.find(i => i.schemaGroupId === b.schemaGroupId),
        parent: parent?.items.find(i => i.schemaGroupId === b.schemaGroupId),
      },
    }),
    {},
  );

  const mergedProperty: P = Object.fromEntries(
    Object.entries(allItems)
      .map(([key, value]) => {
        const { schema, orig, parent } = value;
        if (
          (!orig || orig.__typename === "PropertyGroupList") &&
          (!parent || parent.__typename === "PropertyGroupList")
        ) {
          const used = orig || parent;
          return [
            key,
            used?.groups.map(g => ({
              ...processPropertyGroups(schema, g, undefined, linkedDatasetId, datasets),
              id: g.id,
            })),
          ];
        }

        if (
          (!orig || orig.__typename === "PropertyGroup") &&
          (!parent || parent.__typename === "PropertyGroup")
        ) {
          return [key, processPropertyGroups(schema, parent, orig, linkedDatasetId, datasets)];
        }
        return [key, null];
      })
      .filter(([, value]) => !!value),
  );

  return mergedProperty;
};

const processPropertyGroups = (
  schema: PropertySchemaGroupFragmentFragment,
  parent: PropertyGroupFragmentFragment | null | undefined,
  original: PropertyGroupFragmentFragment | null | undefined,
  linkedDatasetId: string | null | undefined,
  datasets: DatasetMap | null | undefined,
): any => {
  const allFields: Record<
    string,
    {
      schema: PropertySchemaFieldFragmentFragment;
      parent?: PropertyFieldFragmentFragment;
      orig?: PropertyFieldFragmentFragment;
    }
  > = schema.fields.reduce(
    (a, b) => ({
      ...a,
      [b.fieldId]: {
        schema: b,
        parent: parent?.fields.find(i => i.fieldId === b.fieldId),
        orig: original?.fields.find(i => i.fieldId === b.fieldId),
      },
    }),
    {},
  );

  return Object.fromEntries(
    Object.entries(allFields)
      .map(([key, { parent, orig }]) => {
        const used = orig || parent;
        if (!used) return [key, null];

        const datasetSchemaId = used?.links?.[0]?.datasetSchemaId;
        const datasetFieldId = used?.links?.[0]?.datasetSchemaFieldId;
        if (datasetSchemaId && linkedDatasetId && datasetFieldId) {
          return [key, datasetValue(datasets, datasetSchemaId, linkedDatasetId, datasetFieldId)];
        }

        return [key, valueFromGQL(used.value, used.type)?.value];
      })
      .filter(([, value]) => typeof value !== "undefined" && value !== null),
  );
};

export function datasetValue(
  datasets: DatasetMap | null | undefined,
  datasetSchemaId: string,
  datasetId: string,
  fieldId: string,
) {
  const dataset = datasets?.[datasetSchemaId];
  if (!dataset?.schema) return;

  const fieldName = Object.entries(dataset.schema.properties).find(([, v]) => {
    const id = v["$id"].split("/").slice(-1)[0];
    return id === fieldId;
  })?.[0];

  if (!fieldName) return;
  return dataset.datasets.find(d => d[""] === datasetId)?.[fieldName];
}

const processInfobox = (
  orig: EarthLayerFragment["infobox"] | null | undefined,
  parent: EarthLayerFragment["infobox"] | null | undefined,
  linkedDatasetId: string | null | undefined,
  datasets: DatasetMap | null | undefined,
): Layer["infobox"] => {
  const used = orig || parent;
  if (!used) return;
  return {
    property: processProperty(parent?.property, orig?.property, linkedDatasetId, datasets),
    blocks: used.fields.map<Block>(f => ({
      id: f.id,
      pluginId: f.pluginId,
      extensionId: f.extensionId,
      property: processProperty(undefined, f.property, linkedDatasetId, datasets),
      propertyId: f.propertyId, // required by onBlockChange
    })),
  };
};

export const convertWidgets = (
  data: GetEarthWidgetsQuery | undefined,
):
  | {
      floatingWidgets: Widget[];
      alignSystem: WidgetAlignSystem;
      layoutConstraint: { [w in string]: WidgetLayoutConstraint } | undefined;
      ownBuiltinWidgets: (keyof BuiltinWidgets)[];
    }
  | undefined => {
  if (!data?.node || data.node.__typename !== "Scene" || !data.node.widgetAlignSystem) {
    return undefined;
  }

  const layoutConstraint = data.node.plugins
    .map(p =>
      p.plugin?.extensions.reduce<{
        [w in string]: WidgetLayoutConstraint & { floating: boolean };
      }>(
        (b, e) =>
          e?.widgetLayout?.extendable
            ? {
                ...b,
                [`${p.pluginId}/${e.extensionId}`]: {
                  extendable: {
                    horizontally: e?.widgetLayout?.extendable.horizontally,
                    vertically: e?.widgetLayout?.extendable.vertically,
                  },
                  floating: !!e?.widgetLayout?.floating,
                },
              }
            : b,
        {},
      ),
    )
    .reduce((a, b) => ({ ...a, ...b }), {});

  const floatingWidgets = data.node.widgets
    .filter(w => w.enabled && layoutConstraint?.[`${w.pluginId}/${w.extensionId}`]?.floating)
    .map(
      (w): Widget => ({
        id: w.id,
        extended: !!w.extended,
        pluginId: w.pluginId,
        extensionId: w.extensionId,
        property: processProperty(w.property, undefined, undefined, undefined),
      }),
    );

  const widgets = data.node.widgets
    .filter(w => w.enabled && !layoutConstraint?.[`${w.pluginId}/${w.extensionId}`]?.floating)
    .map(
      (w): Widget => ({
        id: w.id,
        extended: !!w.extended,
        pluginId: w.pluginId,
        extensionId: w.extensionId,
        property: processProperty(w.property, undefined, undefined, undefined),
      }),
    );

  const widgetZone = (zone?: Maybe<WidgetZoneType>): WidgetZone | undefined => {
    const left = widgetSection(zone?.left);
    const center = widgetSection(zone?.center);
    const right = widgetSection(zone?.right);
    if (!left && !center && !right) return;
    return {
      left,
      center,
      right,
    };
  };

  const widgetSection = (section?: Maybe<WidgetSectionType>): WidgetSection | undefined => {
    const top = widgetArea(section?.top);
    const middle = widgetArea(section?.middle);
    const bottom = widgetArea(section?.bottom);
    if (!top && !middle && !bottom) return;
    return {
      top,
      middle,
      bottom,
    };
  };

  const widgetArea = (area?: Maybe<WidgetAreaType>): WidgetArea | undefined => {
    const align = area?.align.toLowerCase() as Alignment | undefined;
    const padding = area?.padding as WidgetAreaPadding | undefined;
    const areaWidgets: Widget[] | undefined = area?.widgetIds
      .map<Widget | undefined>(w => widgets.find(w2 => w === w2.id))
      .filter((w): w is Widget => !!w);
    if (!areaWidgets || (areaWidgets && areaWidgets.length < 1)) return;
    return {
      align: align ?? "start",
      padding: {
        top: padding?.top ?? 6,
        bottom: padding?.bottom ?? 6,
        left: padding?.left ?? 6,
        right: padding?.right ?? 6,
      },
      gap: area?.gap ?? 6,
      widgets: areaWidgets,
      background: area?.background as string | undefined,
      centered: area?.centered,
    };
  };

  const ownBuiltinWidgets = data.node.widgets
    .filter(w => w.enabled)
    .map(w => {
      return `${w.pluginId}/${w.extensionId}` as keyof BuiltinWidgets;
    })
    .filter(isBuiltinWidget);

  return {
    floatingWidgets,
    alignSystem: {
      outer: widgetZone(data.node.widgetAlignSystem.outer),
      inner: widgetZone(data.node.widgetAlignSystem.inner),
    },
    layoutConstraint,
    ownBuiltinWidgets,
  };
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
                  (plugin.plugin.id === "reearth" && extension.extensionId.replace(/block$/, "")) ||
                  "plugin",
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

export function processLayerTags(
  tags: {
    tagId: string;
    tag?: Maybe<{ label: string }>;
    children?: { tagId: string; tag?: Maybe<{ label: string }> }[];
  }[],
): Tag[] {
  return tags.map(t => ({
    id: t.tagId,
    label: t.tag?.label ?? "",
    tags: t.children?.map(tt => ({ id: tt.tagId, label: tt.tag?.label ?? "" })),
  }));
}

export function processSceneTags(
  tags: {
    id: string;
    label: string;
    tags?: { id: string; label: string }[];
  }[],
): Tag[] {
  return tags.map(t => ({
    id: t.id,
    label: t.label ?? "",
    tags: t.tags?.map(tt => ({ id: tt.id, label: tt.label ?? "" })),
  }));
}
