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
import { LayerAppearanceTypes } from "@reearth/beta/lib/core/mantle";
import type { Layer } from "@reearth/beta/lib/core/Map";
import { DEFAULT_LAYER_STYLE, valueTypeFromGQL } from "@reearth/beta/utils/value";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import {
  type Maybe,
  type WidgetZone as WidgetZoneType,
  type WidgetSection as WidgetSectionType,
  type WidgetArea as WidgetAreaType,
  type Scene,
  PropertyFragmentFragment,
  PropertySchemaGroupFragmentFragment,
  PropertyItemFragmentFragment,
  PropertyGroupFragmentFragment,
  PropertySchemaFieldFragmentFragment,
  PropertyFieldFragmentFragment,
  ValueType as GQLValueType,
  NlsLayerCommonFragment,
} from "@reearth/services/gql";

export type P = { [key in string]: any };

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
      gap: area?.gap ?? 6,
      widgets: areaWidgets,
      background: area?.background as string | undefined,
      centered: area?.centered,
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
          if (schema.isList) {
            return [key, undefined];
          }
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

export const datasetValue = (
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
  layerStyles?: LayerStyle[],
  _parent?: RawNLSLayer | null | undefined,
): Layer[] | undefined {
  const getLayerStyleValue = (id?: string) => {
    const layerStyleValue: Partial<LayerAppearanceTypes> = layerStyles?.find(
      a => a.id === id,
    )?.value;
    if (typeof layerStyleValue === "object") {
      try {
        return layerStyleValue;
      } catch (e) {
        console.error("Error parsing layerStyle JSON:", e);
      }
    }

    return DEFAULT_LAYER_STYLE;
  };

  return newLayers?.map(nlsLayer => {
    const layerStyle = getLayerStyleValue(nlsLayer.config?.layerStyleId);
    return {
      type: "simple",
      id: nlsLayer.id,
      title: nlsLayer.title,
      visible: nlsLayer.visible,
      infobox: undefined,
      // infobox: nlsLayer.infobox ? processInfobox(nlsLayer.infobox, parent?.infobox) : undefined,
      properties: nlsLayer.config?.properties,
      defines: nlsLayer.config?.defines,
      events: nlsLayer.config?.events,
      data: nlsLayer.config?.data,
      ...layerStyle,
    };
  });
}

// const processInfobox = (
//   orig: EarthLayerFragment["infobox"] | null | undefined,
//   parent: EarthLayerFragment["infobox"] | null | undefined,
// ): Layer["infobox"] => {
//   const used = orig || parent;
//   if (!used) return;
//   return {
//     property: processProperty(parent?.property, orig?.property),
//     blocks: used.fields.map<Block>(f => ({
//       id: f.id,
//       pluginId: f.pluginId,
//       extensionId: f.extensionId,
//       property: processProperty(undefined, f.property),
//       propertyId: f.propertyId, // required by onBlockChange
//     })),
//   };
// };
