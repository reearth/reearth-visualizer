import { Entity, type DataSource, Color, JulianDate } from "cesium";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { KmlDataSource, CzmlDataSource, GeoJsonDataSource, useCesium } from "resium";

import { ComputedFeature, evalFeature, Feature, guessType } from "@reearth/beta/lib/core/mantle";
import { requestIdleCallbackWithRequiredWork } from "@reearth/beta/utils/idle";

import type { ResourceAppearance } from "../../..";
import { useContext } from "../context";
import {
  attachTag,
  getTag,
  extractSimpleLayerData,
  type FeatureComponentConfig,
  type FeatureProps,
} from "../utils";

import { attachStyle, makeFeatureId } from "./utils";

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
    hideIndicator,
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
      data?.time?.updateClockOnLoad ?? true,
    ];
  }, [property, layer]);
  const { viewer } = useCesium();
  const cachedFeatures = useRef<CachedFeature[]>([]);
  const cachedFeatureIds = useRef(new Set<string>());

  const ext = useMemo(() => (!type || type === "auto" ? guessType(url) : undefined), [type, url]);
  const actualType = ext ? types[ext] : type !== "auto" ? type : undefined;
  const Component = actualType ? comps[actualType] : undefined;

  const { requestRender, timelineManagerRef } = useContext();

  const handleChange = useCallback(
    (e: DataSource) => {
      if (!viewer) return;
      const features: Feature[] = [];
      const computedFeatures: ComputedFeature[] = [];
      e.entities.values.forEach(e => {
        const res = attachStyle(e, layer, evalFeature, viewer.clock.currentTime);
        const [feature, computedFeature] = res || [];

        attachTag(e, {
          layerId: layer?.id,
          featureId: feature?.id,
          hideIndicator: computedFeature?.resource?.hideIndicator,
        });

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

      requestRender?.();
    },
    [layer, viewer, onComputedFeatureFetch, type, requestRender],
  );

  const initialClock = useRef({
    start: timelineManagerRef?.current?.timeline?.start,
    stop: timelineManagerRef?.current?.timeline?.stop,
    current: timelineManagerRef?.current?.timeline?.current,
  });
  const handleLoad = useCallback(
    (ds: DataSource) => {
      ds.entities.values.forEach(e =>
        requestAnimationFrame(() => {
          const tag = getTag(e);
          attachTag(e, {
            layerId: layer?.id,
            featureId: makeFeatureId(e),
            hideIndicator: hideIndicator ?? tag?.hideIndicator,
          });
        }),
      );
      if (!updateClock) {
        if (
          initialClock.current.current &&
          initialClock.current.start &&
          initialClock.current.stop
        ) {
          timelineManagerRef?.current?.commit({
            cmd: "SET_TIME",
            payload: {
              start: initialClock.current.start,
              stop: initialClock.current.stop,
              current: initialClock.current.current,
            },
            committer: {
              source: "featureResource",
              id: layer?.id,
            },
          });
        }
        return;
      }
      if (ds.clock) {
        timelineManagerRef?.current?.commit({
          cmd: "SET_TIME",
          payload: {
            start: JulianDate.toDate(ds.clock.startTime),
            stop: JulianDate.toDate(ds.clock.stopTime),
            current: JulianDate.toDate(ds.clock.currentTime),
          },
          committer: {
            source: "featureResource",
            id: layer?.id,
          },
        });
      }
      requestRender?.();
    },
    [updateClock, timelineManagerRef, layer?.id, requestRender, hideIndicator],
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
