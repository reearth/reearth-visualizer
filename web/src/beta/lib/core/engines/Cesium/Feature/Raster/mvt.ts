import { useMemo } from "react";

import { MVTImageryProvider } from "@reearth/cesium-mvt-imagery-provider";

import { extractSimpleLayer } from "../utils";

import { useData, useImageryProvider } from "./hooks";
import type { Props } from "./types";
import { normalizeUrl } from "./utils";

export const useMVT = ({
  isVisible,
  property,
  layer,
}: Pick<Props, "isVisible" | "property" | "layer">) => {
  const { show = true, minimumLevel, maximumLevel, credit } = property ?? {};
  const { type, url, layers } = useData(layer);

  const currentLayer = extractSimpleLayer(layer) || undefined;
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
    });
  }, [isVisible, show, url, layers, type, minimumLevel, maximumLevel, credit, currentLayer]);

  useImageryProvider(imageryProvider, layer?.id, property);
};
