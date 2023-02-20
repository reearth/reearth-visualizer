import composeRefs from "@seznam/compose-react-refs";
import {
  Cesium3DTileFeature,
  Cesium3DTileset,
  Color,
  Entity as CesiumEntity,
  Iso8601,
  JulianDate,
  PropertyBag,
  TimeInterval as CesiumTimeInterval,
  TimeIntervalCollection as CesiumTimeIntervalCollection,
  DistanceDisplayCondition as CesiumDistanceDisplayCondition,
} from "cesium";
import {
  ComponentProps,
  ComponentType,
  ForwardedRef,
  forwardRef,
  useLayoutEffect,
  useRef,
} from "react";
import { type CesiumComponentRef, Entity } from "resium";

import { Data, Layer, LayerSimple, TimeInterval } from "@reearth/core/mantle";

import type { ComputedFeature, ComputedLayer, FeatureComponentProps, Geometry } from "../..";

export type FeatureProps<P = any> = {
  id: string;
  property?: P;
  isVisible?: boolean;
  layer?: ComputedLayer;
  feature?: ComputedFeature;
  geometry?: Geometry;
  sceneProperty?: any;
} & Omit<FeatureComponentProps, "layer">;

export type FeatureComponent = ComponentType<FeatureProps>;

export type FeatureComponentConfig = {
  noLayer?: boolean;
  noFeature?: boolean;
};

export type Tag = {
  layerId?: string;
  featureId?: string;
  draggable?: boolean;
  unselectable?: boolean;
  legacyLocationPropertyKey?: string;
  originalProperties?: any;
};

export const EntityExt = forwardRef(EntityExtComponent);

function EntityExtComponent(
  {
    layerId,
    featureId,
    draggable,
    unselectable,
    legacyLocationPropertyKey,
    ...props
  }: ComponentProps<typeof Entity> & Tag,
  ref: ForwardedRef<CesiumComponentRef<CesiumEntity>>,
) {
  const r = useRef<CesiumComponentRef<CesiumEntity>>(null);

  useLayoutEffect(() => {
    attachTag(r.current?.cesiumElement, {
      layerId: layerId || props.id,
      featureId,
      draggable,
      unselectable,
      legacyLocationPropertyKey,
    });
  }, [draggable, featureId, layerId, legacyLocationPropertyKey, props.id, unselectable]);

  return <Entity ref={composeRefs(ref, r)} {...props} />;
}

export function attachTag(
  entity: CesiumEntity | Cesium3DTileset | Cesium3DTileFeature | null | undefined,
  tag: Tag,
) {
  if (!entity) return;

  if (entity instanceof Cesium3DTileset) {
    (entity as any)[tagKey] = tag;
    return;
  }

  if (entity instanceof Cesium3DTileFeature) {
    (entity as any)[tagKey] = tag;
    return;
  }

  if (!entity.properties) {
    entity.properties = new PropertyBag();
  }
  for (const k of tagKeys) {
    if (!(k in tag) && entity.properties.hasProperty(`reearth_${k}`))
      entity.properties.removeProperty(`reearth_${k}`);
    else entity.properties[`reearth_${k}`] = tag[k];
  }
}

export function getTag(
  entity: CesiumEntity | Cesium3DTileset | Cesium3DTileFeature | null | undefined,
): Tag | undefined {
  if (!entity) return;

  if (entity instanceof Cesium3DTileset) {
    return (entity as any)[tagKey];
  }

  if (entity instanceof Cesium3DTileFeature) {
    return (entity as any)[tagKey];
  }

  if (!entity.properties) return;

  return Object.fromEntries(
    Object.entries(entity.properties)
      .map(([k, v]): readonly [PropertyKey, any] | null => {
        if (!tagKeys.includes(k.replace("reearth_", "") as keyof Tag)) return null;
        return [k.replace("reearth_", ""), v];
      })
      .filter((e): e is readonly [PropertyKey, any] => !!e),
  );
}

const tagObj: { [k in keyof Tag]: 1 } = {
  draggable: 1,
  featureId: 1,
  layerId: 1,
  unselectable: 1,
  originalProperties: 1,
};

const tagKeys = Object.keys(tagObj) as (keyof Tag)[];

const tagKey = "__reearth_tag";

export const extractSimpleLayer = (
  layer: ComputedLayer | Layer | undefined,
): LayerSimple | void => {
  const l = layer && "layer" in layer ? layer.layer : layer;
  if (l?.type !== "simple") {
    return;
  }
  return l;
};

export const extractSimpleLayerData = (layer: ComputedLayer | undefined): Data | void => {
  return extractSimpleLayer(layer)?.data;
};

export const toColor = (c?: string) => {
  if (!c || typeof c !== "string") return undefined;

  // support alpha
  const m = c.match(/^#([A-Fa-f0-9]{6})([A-Fa-f0-9]{2})$|^#([A-Fa-f0-9]{3})([A-Fa-f0-9])$/);
  if (!m) return Color.fromCssColorString(c);

  const alpha = parseInt(m[4] ? m[4].repeat(2) : m[2], 16) / 255;
  return Color.fromCssColorString(`#${m[1] ?? m[3]}`).withAlpha(alpha);
};

export const toTimeInterval = (
  interval: TimeInterval | undefined,
): CesiumTimeIntervalCollection | undefined => {
  if (!interval) {
    return;
  }
  return new CesiumTimeIntervalCollection([
    new CesiumTimeInterval({
      start: JulianDate.fromDate(interval[0]),
      stop: interval[1] ? JulianDate.fromDate(interval[1]) : Iso8601.MAXIMUM_VALUE,
    }),
  ]);
};

export const toDistanceDisplayCondition = (
  near: number | undefined,
  far: number | undefined,
): CesiumDistanceDisplayCondition | undefined => {
  return typeof near === "number" || typeof far === "number"
    ? new CesiumDistanceDisplayCondition(near ?? 0.0, far ?? Number.MAX_VALUE)
    : undefined;
};
