import { useEffect, useMemo, useRef } from "react";

import { MVTImageryProvider } from "@reearth/cesium-mvt-imagery-provider";

import { MarkerAppearance, PolygonAppearance, PolylineAppearance } from "../../..";
import { extractSimpleLayer, usePick } from "../utils";

import { useData, useImageryProvider } from "./hooks";
import type { Props } from "./types";
import { normalizeUrl } from "./utils";

export const useMVT = ({
  isVisible,
  property,
  layer,
}: Pick<Props, "isVisible" | "property" | "layer" | "evalFeature">) => {
  const { show = true, minimumLevel, maximumLevel, credit } = property ?? {};
  const { type, url, layers } = useData(layer);

  const cachedCalculatedLayerRef = useRef(layer);
  const updatedAt = useRef<number>();

  const currentLayer = extractSimpleLayer(layer) || undefined;
  console.log("currentLayer from reearth: ", currentLayer);

  const layerPolygonAppearance = usePick(currentLayer?.polygon, polygonAppearanceFields);
  const layerPolylineAppearance = usePick(currentLayer?.polyline, polylineAppearanceFields);
  const layerMarkerAppearance = usePick(currentLayer?.marker, markerAppearanceFields);
  const layerVisibility = currentLayer?.visible;

  const imageryProvider = useMemo(() => {
    if (!isVisible || !show || !url || !layers || type !== "mvt") return;
    console.log("reached here!!!");
    console.log("updatedAt: ", updatedAt.current);
    return new MVTImageryProvider({
      minimumLevel,
      maximumLevel,
      credit,
      urlTemplate: normalizeUrl(url, "mvt") as `http${"s" | ""}://${string}/{z}/{x}/{y}${string}`,
      layerName: layers,
      layer: currentLayer,
      worker: true,
      updatedAt: updatedAt.current || Date.now(),
    });
  }, [isVisible, show, url, layers, type, minimumLevel, maximumLevel, currentLayer, credit]);

  const cacheKeyForUpdatedAt = useMemo(
    () =>
      JSON.stringify(layerPolygonAppearance) +
      JSON.stringify(layerPolylineAppearance) +
      JSON.stringify(layerMarkerAppearance) +
      layerVisibility,
    [layerPolygonAppearance, layerPolylineAppearance, layerMarkerAppearance, layerVisibility],
  );

  useEffect(() => {
    if (layerVisibility !== undefined) {
      updatedAt.current = Date.now();
    }
  }, [layerVisibility]);

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
