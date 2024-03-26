import { Math as CesiumMath, Rectangle } from "cesium";
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
  const { show = true, minimumLevel, maximumLevel, bounds, credit } = property ?? {};
  const { type, url, layers } = useData(layer);

  const currentLayer = extractSimpleLayer(layer) || undefined;

  console.log("property: ", property);

  const imageryProvider = useMemo(() => {
    if (!isVisible || !show || !url || !layers || type !== "mvt") return;
    const boundsTemp =
      bounds?.split(",").map((value: string) => CesiumMath.toRadians(+value)) || [];
    const rectangle = new Rectangle(...boundsTemp);
    return new MVTImageryProvider({
      minimumLevel,
      maximumLevel,
      credit,
      urlTemplate: normalizeUrl(url, "mvt") as `http${"s" | ""}://${string}/{z}/{x}/{y}${string}`,
      layerName: layers,
      layer: currentLayer,
      worker: true,
      rectangle,
    });
  }, [
    isVisible,
    show,
    url,
    layers,
    type,
    bounds,
    minimumLevel,
    maximumLevel,
    credit,
    currentLayer,
  ]);

  useImageryProvider(imageryProvider, layer?.id, property);
};
