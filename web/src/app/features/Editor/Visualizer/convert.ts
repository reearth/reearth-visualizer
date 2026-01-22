import {
  type WidgetZone,
  type WidgetSection,
  type WidgetArea,
  type Alignment
} from "@reearth/app/features/Visualizer/Crust";
import {
  BuiltinWidgets,
  Widget as RawWidget,
  WidgetAlignSystem,
  WidgetLayoutConstraint,
  isBuiltinWidget
} from "@reearth/app/features/Visualizer/Crust/Widgets";
import { WidgetAreaPadding } from "@reearth/app/features/Visualizer/Crust/Widgets/WidgetAlignSystem/types";
import { DeviceType } from "@reearth/app/utils/device";
import { getLayerStyleValue } from "@reearth/app/utils/layer-style";
import {
  valueTypeFromGQL,
  type ValueTypes,
  type ValueType
} from "@reearth/app/utils/value";
import type { Layer } from "@reearth/core";
import type { NLSLayer } from "@reearth/services/api/layer";
import type { LayerStyle } from "@reearth/services/api/layerStyle";
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
  NlsLayerCommonFragment
} from "@reearth/services/gql";

import convertInfobox from "./convert-infobox";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type P = Record<string, any>; // Properties have dynamic structure based on schema

export type Widget = Omit<RawWidget, "layout" | "extended"> & {
  extended?: boolean;
};

export const convertWidgets = (
  scene?: Partial<Scene>,
  device?: DeviceType
):
  | {
      floating: Widget[];
      alignSystem: WidgetAlignSystem;
      layoutConstraint: Record<string, WidgetLayoutConstraint> | undefined;
      ownBuiltinWidgets: (keyof BuiltinWidgets)[];
    }
  | undefined => {
  const layoutConstraint = scene?.plugins
    ?.map((p) =>
      p.plugin?.extensions.reduce<Record<string, WidgetLayoutConstraint & { floating: boolean }>>(
        (b, e) =>
          e?.widgetLayout?.extendable
            ? {
                ...b,
                [`${p.plugin?.id}/${e.extensionId}`]: {
                  extendable: {
                    horizontally: e?.widgetLayout?.extendable.horizontally,
                    vertically: e?.widgetLayout?.extendable.vertically
                  },
                  floating: !!e?.widgetLayout?.floating
                }
              }
            : b,
        {}
      )
    )
    .reduce((a, b) => ({ ...a, ...b }), {});

  const floating = scene?.widgets
    ?.filter(
      (w) =>
        w.enabled &&
        layoutConstraint?.[`${w.pluginId}/${w.extensionId}`]?.floating
    )
    .map(
      (w): Widget => ({
        id: w.id,
        extended: !!w.extended,
        pluginId: w.pluginId,
        extensionId: w.extensionId,
        property: processProperty(w.property, undefined)
      })
    );

  const widgets = scene?.widgets
    ?.filter(
      (w) =>
        w.enabled &&
        !layoutConstraint?.[`${w.pluginId}/${w.extensionId}`]?.floating
    )
    .map(
      (w): Widget => ({
        id: w.id,
        extended: !!w.extended,
        pluginId: w.pluginId,
        extensionId: w.extensionId,
        property: processProperty(w.property, undefined)
      })
    );

  const widgetZone = (zone?: Maybe<WidgetZoneType>): WidgetZone | undefined => {
    const left = widgetSection(zone?.left);
    const center = widgetSection(zone?.center);
    const right = widgetSection(zone?.right);
    if (!left && !center && !right) return;
    return {
      left,
      center,
      right
    };
  };

  const widgetSection = (
    section?: Maybe<WidgetSectionType>
  ): WidgetSection | undefined => {
    const top = widgetArea(section?.top);
    const middle = widgetArea(section?.middle);
    const bottom = widgetArea(section?.bottom);
    if (!top && !middle && !bottom) return;
    return {
      top,
      middle,
      bottom
    };
  };

  const widgetArea = (area?: Maybe<WidgetAreaType>): WidgetArea | undefined => {
    const align = area?.align.toLowerCase() as Alignment | undefined;
    const padding = area?.padding as WidgetAreaPadding | undefined;
    const areaWidgets: Widget[] | undefined = area?.widgetIds
      .map<Widget | undefined>((w) => widgets?.find((w2) => w === w2.id))
      .filter((w): w is Widget => !!w);
    if (!areaWidgets || (areaWidgets && areaWidgets.length < 1)) return;
    return {
      align: align ?? "start",
      padding: {
        top: padding?.top ?? 6,
        bottom: padding?.bottom ?? 6,
        left: padding?.left ?? 6,
        right: padding?.right ?? 6
      },
      gap: area?.gap ?? 6,
      widgets: areaWidgets,
      background: area?.background as string | undefined,
      centered: area?.centered
    };
  };

  const ownBuiltinWidgets = scene?.widgets
    ?.filter((w) => w.enabled)
    .map((w) => {
      return `${w.pluginId}/${w.extensionId}` as keyof BuiltinWidgets;
    })
    .filter(isBuiltinWidget);

  return {
    floating: floating ?? [],
    alignSystem: {
      outer: widgetZone(scene?.widgetAlignSystem?.[device ?? "desktop"]?.outer),
      inner: widgetZone(scene?.widgetAlignSystem?.[device ?? "desktop"]?.inner)
    },
    layoutConstraint,
    ownBuiltinWidgets: ownBuiltinWidgets ?? []
  };
};

export const processProperty = (
  parent: PropertyFragmentFragment | null | undefined,
  orig?: PropertyFragmentFragment | null | undefined
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
        orig: orig?.items.find((i) => i.schemaGroupId === b.schemaGroupId),
        parent: parent?.items.find((i) => i.schemaGroupId === b.schemaGroupId)
      }
    }),
    {}
  );
  const mergedProperty: P = Object.fromEntries(
    Object.entries(allItems)
      .map(([key, value]) => {
        const { schema, orig, parent } = value;
        if (!orig && !parent) {
          if (schema.isList) {
            return [key, undefined];
          }
          return [key, processPropertyGroups(schema, undefined, undefined)];
        }

        if (
          (!orig || orig.__typename === "PropertyGroupList") &&
          (!parent || parent.__typename === "PropertyGroupList")
        ) {
          const used = orig || parent;
          return [
            key,
            used?.groups.map((g) => ({
              ...processPropertyGroups(schema, g, undefined),
              id: g.id
            }))
          ];
        }

        if (
          (!orig || orig.__typename === "PropertyGroup") &&
          (!parent || parent.__typename === "PropertyGroup")
        ) {
          return [key, processPropertyGroups(schema, parent, orig)];
        }
        return [key, null];
      })
      .filter(([, value]) => !!value)
  );

  return mergedProperty;
};

const processPropertyGroups = (
  schema: PropertySchemaGroupFragmentFragment,
  parent: PropertyGroupFragmentFragment | null | undefined,
  original: PropertyGroupFragmentFragment | null | undefined
): Record<string, ValueTypes[ValueType] | null | undefined> => {
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
        parent: parent?.fields.find((i) => i.fieldId === b.fieldId),
        orig: original?.fields.find((i) => i.fieldId === b.fieldId)
      }
    }),
    {}
  );

  return Object.fromEntries(
    Object.entries(allFields)
      .map(([key, { parent, orig }]) => {
        const used = orig || parent;
        if (!used) return [key, null];
        return [key, valueFromGQL(used.value, used.type)?.value];
      })
      .filter(([, value]) => typeof value !== "undefined" && value !== null)
  );
};

export const valueFromGQL = (val: unknown, type: GQLValueType) => {
  const t = valueTypeFromGQL(type);
  if (typeof val === "undefined" || val === null || !t) {
    return undefined;
  }
  const ok = typeof val !== "undefined" && val !== null;
  let newVal = val;
  if (t === "camera" && val && typeof val === "object" && "altitude" in val) {
    newVal = {
      ...val,
      height: val.altitude
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
      textAlign: val.textAlign.toLowerCase()
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
  parent?: RawNLSLayer | null | undefined,
  infoboxBlockNames?: Record<string, string>
): Layer[] | undefined {
  return newLayers?.map((nlsLayer) => {
    const layerStyle = getLayerStyleValue(
      layerStyles,
      nlsLayer.config?.layerStyleId,
      nlsLayer.config?.data?.type
    );

    const sketchLayerData = nlsLayer.isSketch && {
      ...nlsLayer.config.data,
      value: {
        type: "FeatureCollection",
        features: nlsLayer.sketch?.featureCollection?.features.map((f) => ({
          ...f,
          geometry: f.geometry[0]
        }))
      },
      isSketchLayer: true,
      idProperty: "id"
    };

    return {
      type: "simple",
      id: nlsLayer.id,
      title: nlsLayer.title,
      visible: nlsLayer.visible,
      sketch: nlsLayer.sketch,
      isSketch: nlsLayer.isSketch,
      infobox: convertInfobox(
        nlsLayer.infobox,
        parent?.infobox,
        infoboxBlockNames
      ),
      properties: nlsLayer.config?.properties,
      defines: nlsLayer.config?.defines,
      events: nlsLayer.config?.events,
      data: nlsLayer.isSketch ? sketchLayerData : nlsLayer.config?.data,
      ...layerStyle
    };
  });
}
