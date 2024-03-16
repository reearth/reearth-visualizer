import { useEffect, useMemo, useRef } from "react";

import { MVTImageryProvider } from "@reearth/cesium-mvt-imagery-provider";

import { extractSimpleLayer } from "../utils";

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
  console.log("currentLayer: ", currentLayer);

  const imageryProvider = useMemo(() => {
    if (!isVisible || !show || !url || !layers || type !== "mvt") return;
    return new MVTImageryProvider({
      minimumLevel,
      maximumLevel,
      credit,
      urlTemplate: normalizeUrl(url, "mvt") as `http${"s" | ""}://${string}/{z}/{x}/{y}${string}`,
      layerName: layers,
      layer: currentLayer,
      worker: true,
      updatedAt: updatedAt.current,
    });
  }, [isVisible, show, url, layers, type, minimumLevel, maximumLevel, currentLayer, credit]);

  useEffect(() => {
    cachedCalculatedLayerRef.current = layer;
    updatedAt.current = Date.now();
  }, [layer]);

  useImageryProvider(imageryProvider, layer?.id, property);
};
