import { useEffect, useMemo, useRef } from "react";

import { MVTImageryProvider } from "@reearth/cesium-mvt-imagery-provider";

import type { PolygonAppearance, PolylineAppearance, MarkerAppearance } from "../../..";
import { usePick, extractSimpleLayer } from "../utils";

import { useData, useImageryProvider } from "./hooks";
import type { Props } from "./types";
import { normalizeUrl } from "./utils";

export const useMVT = ({
  isVisible,
  property,
  layer,
  evalFeature,
}: Pick<Props, "isVisible" | "property" | "layer" | "evalFeature">) => {
  const { show = true, minimumLevel, maximumLevel, credit } = property ?? {};
  const { type, url, layers } = useData(layer);

  const cachedCalculatedLayerRef = useRef(layer);

  const layerSimple = extractSimpleLayer(layer);
  const layerPolygonAppearance = usePick(layerSimple?.polygon, polygonAppearanceFields);
  const layerPolylineAppearance = usePick(layerSimple?.polyline, polylineAppearanceFields);
  const layerMarkerAppearance = usePick(layerSimple?.marker, markerAppearanceFields);

  const updatedAt = useRef<number>();

  const imageryProvider = useMemo(
    () => {
      if (!isVisible || !show || !url || !layers || type !== "mvt") return;
      return new MVTImageryProvider({
        minimumLevel,
        maximumLevel,
        credit,
        urlTemplate: normalizeUrl(url, "mvt") as `http${"s" | ""}://${string}/{z}/{x}/{y}${string}`,
        layerName: layers,
        layer: extractSimpleLayer(cachedCalculatedLayerRef.current?.layer) || undefined,
        worker: true,
        updatedAt: updatedAt.current,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Render MVT depends on appearance
    [
      isVisible,
      show,
      url,
      layers,
      type,
      minimumLevel,
      maximumLevel,
      credit,
      evalFeature,
      layerPolygonAppearance,
      layerPolylineAppearance,
      layerMarkerAppearance,
    ],
  );

  const cacheKeyForUpdatedAt = useMemo(
    () =>
      JSON.stringify(layerPolygonAppearance) +
      JSON.stringify(layerPolylineAppearance) +
      JSON.stringify(layerMarkerAppearance),
    [layerPolygonAppearance, layerPolylineAppearance, layerMarkerAppearance],
  );

  useEffect(() => {
    updatedAt.current = Date.now();
  }, [cacheKeyForUpdatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    cachedCalculatedLayerRef.current = layer;
  }, [layer]);

  useImageryProvider(imageryProvider, layer?.id, property);
};

const polygonAppearanceFields: (keyof PolygonAppearance)[] = [
  "show",
  "fill",
  "fillColor",
  "stroke",
  "strokeColor",
  "strokeWidth",
  "lineJoin",
];

const polylineAppearanceFields: (keyof PolylineAppearance)[] = [
  "show",
  "strokeColor",
  "strokeWidth",
];

const markerAppearanceFields: (keyof MarkerAppearance)[] = ["show", "pointColor", "pointSize"];
