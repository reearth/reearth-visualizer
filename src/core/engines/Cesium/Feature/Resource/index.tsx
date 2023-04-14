import { Entity, type DataSource, Color } from "cesium";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { KmlDataSource, CzmlDataSource, GeoJsonDataSource, useCesium } from "resium";

import { ComputedFeature, evalFeature, Feature, guessType } from "@reearth/core/mantle";
import { requestIdleCallbackWithRequiredWork } from "@reearth/util/idle";

import type { ResourceAppearance } from "../../..";
import {
  attachTag,
  extractSimpleLayerData,
  type FeatureComponentConfig,
  type FeatureProps,
} from "../utils";

import { attachStyle } from "./utils";

export type Props = FeatureProps<Property>;
export type Property = ResourceAppearance;
const types: Record<string, "geojson" | "kml" | "czml"> = {
  kml: "kml",
  geojson: "geojson",
  czml: "czml",
};

const comps = {
  kml: KmlDataSource,
  czml: CzmlDataSource,
  geojson: GeoJsonDataSource,
};

type CachedFeature = {
  feature: Feature;
  raw: Entity;
};

export default function Resource({
  isVisible,
  property,
  layer,
  onComputedFeatureFetch,
  onComputedFeatureDelete,
}: Props) {
  const {
    show = true,
    clampToGround,
    stroke,
    strokeWidth,
    markerColor,
    markerSize,
    fill,
  } = property ?? {};
  const [type, url, updateClock] = useMemo((): [
    ResourceAppearance["type"],
    string | undefined,
    boolean,
  ] => {
    const data = extractSimpleLayerData(layer);
    const type = property?.type;
    const url = property?.url;
    return [
      type ?? (data?.type as ResourceAppearance["type"]),
      url ?? data?.url,
      !!data?.time?.updateClockOnLoad,
    ];
  }, [property, layer]);
  const { viewer } = useCesium();
  const cachedFeatures = useRef<CachedFeature[]>([]);
  const cachedFeatureIds = useRef(new Set<string>());

  const ext = useMemo(() => (!type || type === "auto" ? guessType(url) : undefined), [type, url]);
  const actualType = ext ? types[ext] : type !== "auto" ? type : undefined;
  const Component = actualType ? comps[actualType] : undefined;

  const handleChange = useCallback(
    (e: DataSource) => {
      if (!viewer) return;
      const features: Feature[] = [];
      const computedFeatures: ComputedFeature[] = [];
      e.entities.values.forEach(e => {
        const res = attachStyle(e, layer, evalFeature, viewer.clock.currentTime);
        const [feature, computedFeature] = res || [];

        attachTag(e, { layerId: layer?.id, featureId: feature?.id });

        if (feature && !cachedFeatureIds.current.has(feature.id)) {
          features.push(feature);
          cachedFeatures.current.push({ feature, raw: e });
          cachedFeatureIds.current.add(feature.id);
        }
        if (computedFeature) {
          computedFeatures.push(computedFeature);
        }
      });

      // GeoJSON is not delegated data, so we need to skip.
      if (type !== "geojson") {
        onComputedFeatureFetch?.(features, computedFeatures);
      }
    },
    [layer, viewer, onComputedFeatureFetch, type],
  );

  const initialClock = useRef({
    start: viewer?.clock.startTime,
    stop: viewer?.clock.stopTime,
    current: viewer?.clock.currentTime,
  });
  const handleLoad = useCallback(
    (ds: DataSource) => {
      if (!viewer?.clock) return;
      if (!updateClock) {
        if (
          initialClock.current.current &&
          initialClock.current.start &&
          initialClock.current.stop
        ) {
          viewer.clock.currentTime = initialClock.current.current;
          viewer.clock.startTime = initialClock.current.start;
          viewer.clock.stopTime = initialClock.current.stop;
        }
        return;
      }
      if (ds.clock) {
        viewer.clock.currentTime = ds.clock.currentTime;
        viewer.clock.startTime = ds.clock.startTime;
        viewer.clock.stopTime = ds.clock.stopTime;
      }
    },
    [updateClock, viewer?.clock],
  );

  // convert hexCodeColorString to ColorValue?s
  const strokeValue = useMemo(
    () => (stroke ? Color.fromCssColorString(stroke) : undefined),
    [stroke],
  );
  const fillValue = useMemo(() => (fill ? Color.fromCssColorString(fill) : undefined), [fill]);
  const markerColorValue = useMemo(
    () => (markerColor ? Color.fromCssColorString(markerColor) : undefined),
    [markerColor],
  );

  useEffect(() => {
    if (!viewer) return;
    cachedFeatures.current.forEach(f => {
      attachStyle(f.raw, layer, evalFeature, viewer.clock.currentTime);
    });
  }, [layer, viewer]);

  useEffect(
    () => () => {
      requestIdleCallbackWithRequiredWork(() => {
        onComputedFeatureDelete?.(Array.from(cachedFeatureIds.current.values()));
      });
    },
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (!isVisible || !show || !Component || !url) return null;

  return (
    <Component
      data={url}
      show={true}
      clampToGround={clampToGround}
      onChange={handleChange}
      onLoad={handleLoad}
      stroke={strokeValue}
      fill={fillValue}
      strokeWidth={strokeWidth}
      markerSize={markerSize}
      markerColor={markerColorValue}
    />
  );
}

export const config: FeatureComponentConfig = {
  noFeature: true,
};
