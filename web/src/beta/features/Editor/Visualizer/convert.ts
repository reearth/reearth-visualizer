import {
  type WidgetZone,
  type WidgetSection,
  type WidgetArea,
  type Alignment,
} from "@reearth/beta/lib/core/Crust";
import {
  BuiltinWidgets,
  Widget as RawWidget,
  WidgetAlignSystem,
  WidgetLayoutConstraint,
  isBuiltinWidget,
} from "@reearth/beta/lib/core/Crust/Widgets";
import { WidgetAreaPadding } from "@reearth/beta/lib/core/Crust/Widgets/WidgetAlignSystem/types";
import type { Block, Tag } from "@reearth/beta/lib/core/mantle/compat/types";
import type { Layer } from "@reearth/beta/lib/core/Map";
import { Story, StoryBlock, StoryPage } from "@reearth/beta/lib/core/StoryPanel/types";
import { valueTypeFromGQL } from "@reearth/beta/utils/value";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { toUi } from "@reearth/services/api/propertyApi/utils";
import {
  type Maybe,
  type WidgetZone as WidgetZoneType,
  type WidgetSection as WidgetSectionType,
  type WidgetArea as WidgetAreaType,
  type Scene,
  EarthLayerFragment,
  PropertyFragmentFragment,
  PropertySchemaGroupFragmentFragment,
  PropertyItemFragmentFragment,
  PropertyGroupFragmentFragment,
  PropertySchemaFieldFragmentFragment,
  PropertyFieldFragmentFragment,
  ValueType as GQLValueType,
  NlsLayerCommonFragment,
  Story as GqlStory,
  StoryPage as GqlStoryPage,
  StoryBlock as GqlStoryBlock,
} from "@reearth/services/gql";

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

export type Widget = Omit<RawWidget, "layout" | "extended"> & {
  extended?: boolean;
};

export const convertWidgets = (
  scene?: Partial<Scene>,
):
  | {
      floating: Widget[];
      alignSystem: WidgetAlignSystem;
      layoutConstraint: { [w in string]: WidgetLayoutConstraint } | undefined;
      ownBuiltinWidgets: (keyof BuiltinWidgets)[];
    }
  | undefined => {
  const layoutConstraint = scene?.plugins
    ?.map(p =>
      p.plugin?.extensions.reduce<{
        [w in string]: WidgetLayoutConstraint & { floating: boolean };
      }>(
        (b, e) =>
          e?.widgetLayout?.extendable
            ? {
                ...b,
                [`${p.plugin?.id}/${e.extensionId}`]: {
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

  const floating = scene?.widgets
    ?.filter(w => w.enabled && layoutConstraint?.[`${w.pluginId}/${w.extensionId}`]?.floating)
    .map(
      (w): Widget => ({
        id: w.id,
        extended: !!w.extended,
        pluginId: w.pluginId,
        extensionId: w.extensionId,
        property: processProperty(w.property, undefined, undefined, undefined),
      }),
    );

  const widgets = scene?.widgets
    ?.filter(w => w.enabled && !layoutConstraint?.[`${w.pluginId}/${w.extensionId}`]?.floating)
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
      .map<Widget | undefined>(w => widgets?.find(w2 => w === w2.id))
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
      widgets: areaWidgets,
      background: area?.background as string | undefined,
      centered: area?.centered,
      gap: area?.gap ?? undefined,
    };
  };

  const ownBuiltinWidgets = scene?.widgets
    ?.filter(w => w.enabled)
    .map(w => {
      return `${w.pluginId}/${w.extensionId}` as keyof BuiltinWidgets;
    })
    .filter(isBuiltinWidget);

  return {
    floating: floating ?? [],
    alignSystem: {
      outer: widgetZone(scene?.widgetAlignSystem?.outer),
      inner: widgetZone(scene?.widgetAlignSystem?.inner),
    },
    layoutConstraint,
    ownBuiltinWidgets: ownBuiltinWidgets ?? [],
  };
};

export const convertStory = (story?: GqlStory): Story | undefined => {
  if (!story) return undefined;

  const storyPages = (pages: GqlStoryPage[]): StoryPage[] =>
    pages.map(p => ({
      id: p.id,
      title: p.title,
      propertyId: p.propertyId,
      property: processProperty(undefined, p.property),
      blocks: storyBlocks(p.blocks),
    }));

  const storyBlocks = (blocks: GqlStoryBlock[]): StoryBlock[] =>
    blocks.map(b => ({
      id: b.id,
      pluginId: b.pluginId,
      extensionId: b.extensionId,
      name: b.property?.schema?.groups.find(g => g.schemaGroupId === "default")?.title,
      propertyId: b.property?.id,
      property: processProperty(undefined, b.property),
    }));

  return {
    id: story.id,
    title: story.title,
    pages: storyPages(story.pages),
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
        if (!orig && !parent) {
          return [
            key,
            processPropertyGroups(schema, undefined, undefined, linkedDatasetId, datasets),
          ];
        }

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
    Object.entries(allFields).map(([key, { schema, parent, orig }]) => {
      const used = orig || parent;

      const fieldMeta = {
        type: valueTypeFromGQL(schema.type) || undefined,
        ui: toUi(schema.ui) || undefined,
        title: schema.translatedTitle || undefined,
        description: schema.translatedDescription || undefined,
      };

      if (!used) {
        return [
          key,
          {
            ...fieldMeta,
            value: schema.defaultValue
              ? valueFromGQL(schema.defaultValue, schema.type)?.value
              : undefined,
          },
        ];
      }

      const datasetSchemaId = used?.links?.[0]?.datasetSchemaId;
      const datasetFieldId = used?.links?.[0]?.datasetSchemaFieldId;
      if (datasetSchemaId && linkedDatasetId && datasetFieldId) {
        return [
          key,
          {
            ...fieldMeta,
            value: datasetValue(datasets, datasetSchemaId, linkedDatasetId, datasetFieldId),
          },
        ];
      }

      return [
        key,
        {
          ...fieldMeta,
          value: valueFromGQL(used.value, used.type)?.value,
        },
      ];
    }),
  );
};

const datasetValue = (
  datasets: DatasetMap | null | undefined,
  datasetSchemaId: string,
  datasetId: string,
  fieldId: string,
) => {
  const dataset = datasets?.[datasetSchemaId];
  if (!dataset?.schema) return;

  const fieldName = Object.entries(dataset.schema.properties).find(([, v]) => {
    const id = v["$id"].split("/").slice(-1)[0];
    return id === fieldId;
  })?.[0];

  if (!fieldName) return;
  return dataset.datasets.find(d => d[""] === datasetId)?.[fieldName];
};

export const valueFromGQL = (val: any, type: GQLValueType) => {
  const t = valueTypeFromGQL(type);
  if (typeof val === "undefined" || val === null || !t) {
    return undefined;
  }
  const ok = typeof val !== "undefined" && val !== null;
  let newVal = val;
  if (t === "camera" && val && typeof val === "object" && "altitude" in val) {
    newVal = {
      ...val,
      height: val.altitude,
    };
  }
  if (
    t === "typography" &&
    val &&
    typeof val === "object" &&
    "textAlign" in val &&
    typeof val.textAlign === "string"
  ) {
    newVal = {
      ...val,
      textAlign: val.textAlign.toLowerCase(),
    };
  }
  return { type: t, value: newVal ?? undefined, ok };
};

export type RawNLSLayer = NlsLayerCommonFragment & {
  __typename: "NLSLayerGroup";
  children?: RawNLSLayer[] | null | undefined;
};

export function processLayers(
  newLayers?: NLSLayer[],
  parent?: RawNLSLayer | null | undefined,
): Layer[] | undefined {
  return newLayers?.map(nlsLayer => ({
    type: "simple",
    id: nlsLayer.id,
    title: nlsLayer.title,
    visible: nlsLayer.visible,
    infobox: processInfobox(nlsLayer.infobox, parent?.infobox),
    tags: processLayerTags(nlsLayer.tags),
    properties: nlsLayer.config?.properties,
    defines: nlsLayer.config?.defines,
    events: nlsLayer.config?.events,
    data: nlsLayer.config?.data,
    resource: nlsLayer.config?.resource,
    marker: nlsLayer.config?.marker,
    polygon: nlsLayer.config?.polygon,
    polyline: nlsLayer.config?.polyline,
  }));
}

const processInfobox = (
  orig: EarthLayerFragment["infobox"] | null | undefined,
  parent: EarthLayerFragment["infobox"] | null | undefined,
): Layer["infobox"] => {
  const used = orig || parent;
  if (!used) return;
  return {
    property: processProperty(parent?.property, orig?.property),
    blocks: used.fields.map<Block>(f => ({
      id: f.id,
      pluginId: f.pluginId,
      extensionId: f.extensionId,
      property: processProperty(undefined, f.property),
      propertyId: f.propertyId, // required by onBlockChange
    })),
  };
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
    tags: t.children?.map(tt => ({
      id: tt.tagId,
      label: tt.tag?.label ?? "",
    })),
  }));
}
