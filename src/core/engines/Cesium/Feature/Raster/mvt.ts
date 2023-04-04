import { VectorTileFeature } from "@mapbox/vector-tile";
import { ImageryLayerFeatureInfo } from "cesium";
import { MVTImageryProvider } from "cesium-mvt-imagery-provider";
import { useEffect, useMemo, useRef } from "react";

import type { ComputedFeature, Feature, PolygonAppearance } from "../../..";
import { usePick, extractSimpleLayer, generateIDWithMD5 } from "../utils";

import { useData, useImageryProvider } from "./hooks";
import type { Props } from "./types";
import { normalizeUrl } from "./utils";

type TileCoords = { x: number; y: number; level: number };

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

  const updatedAt = useRef<number>();

  const imageryProvider = useMemo(
    () => {
      if (!isVisible || !show || !url || !layers || type !== "mvt") return;
      let currentTime: number | undefined;
      const cachedStyleMap = new Map();
      return new MVTImageryProvider({
        minimumLevel,
        maximumLevel,
        credit,
        urlTemplate: normalizeUrl(url, "mvt") as `http${"s" | ""}://${string}/{z}/{x}/{y}${string}`,
        layerName: layers,
        onRenderFeature: () => {
          if (!currentTime) {
            currentTime = updatedAt.current;
          }
          return currentTime === updatedAt.current;
        },
        style: (mvtFeature, tile) => {
          const styleCacheKey = JSON.stringify(mvtFeature.properties);
          const cachedStyle = cachedStyleMap.get(styleCacheKey);
          if (cachedStyle) {
            return cachedStyle;
          }
          const computedFeature = ((): ComputedFeature | void => {
            const layer = cachedCalculatedLayerRef.current?.layer;
            if (
              layer?.type === "simple" &&
              VectorTileFeature.types[mvtFeature.type] === "Polygon"
            ) {
              const feature = makeFeatureFromPolygon("", mvtFeature, tile);
              return evalFeature?.(layer, feature);
            }
          })();

          const polygon = computedFeature?.polygon;
          const style = {
            fillStyle:
              (polygon?.fill ?? true) && (polygon?.show ?? true)
                ? polygon?.fillColor
                : "rgba(0,0,0,0)", // hide the feature
            strokeStyle:
              polygon?.stroke && (polygon?.show ?? true) ? polygon?.strokeColor : "rgba(0,0,0,0)", // hide the feature
            lineWidth: polygon?.strokeWidth,
            lineJoin: polygon?.lineJoin,
          };
          cachedStyleMap.set(styleCacheKey, style);
          return style;
        },
        onSelectFeature: (mvtFeature, tile) => {
          const layer = extractSimpleLayer(cachedCalculatedLayerRef.current?.layer);
          if (!layer) {
            return;
          }
          const id = mvtFeature.id
            ? String(mvtFeature.id)
            : idFromGeometry(mvtFeature.loadGeometry(), tile);
          const feature = evalFeature(layer, makeFeatureFromPolygon(id, mvtFeature, tile));
          const info = new ImageryLayerFeatureInfo();
          info.data = {
            layerId: layer?.id,
            featureId: id,
            feature,
            appearanceType: VectorTileFeature.types[mvtFeature.type].toLowerCase(),
          };
          return info;
        },
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
    ],
  );

  useEffect(() => {
    updatedAt.current = Date.now();
  }, [JSON.stringify(layerPolygonAppearance)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    cachedCalculatedLayerRef.current = layer;
  }, [layer]);

  useImageryProvider(imageryProvider, layer?.id, property);
};

const idFromGeometry = (
  geometry: ReturnType<VectorTileFeature["loadGeometry"]>,
  tile: TileCoords,
) => {
  const id = [tile.x, tile.y, tile.level, ...geometry.flatMap(i => i.map(j => [j.x, j.y]))].join(
    ":",
  );

  return generateIDWithMD5(id);
};

const makeFeatureFromPolygon = (
  id: string,
  feature: VectorTileFeature,
  tile: TileCoords,
): Feature => {
  const geometry = feature.loadGeometry();
  const coordinates = geometry.map(points => points.map(p => [p.x, p.y]));
  return {
    type: "feature",
    id,
    geometry: {
      type: "Polygon",
      coordinates,
    },
    properties: feature.properties,
    range: {
      x: tile.x,
      y: tile.y,
      z: tile.level,
    },
  };
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
