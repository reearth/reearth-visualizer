import { VectorTileFeature } from "@mapbox/vector-tile";
import type { Polygon, LineString, Point } from "@turf/turf";
import { ImageryLayerFeatureInfo } from "cesium";
import { MVTImageryProvider } from "cesium-mvt-imagery-provider";
import { useEffect, useMemo, useRef } from "react";

import type {
  ComputedFeature,
  Feature,
  PolygonAppearance,
  Geometry,
  PolylineAppearance,
  MarkerAppearance,
} from "../../..";
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
  const layerPolylineAppearance = usePick(layerSimple?.polyline, polylineAppearanceFields);
  const layerMarkerAppearance = usePick(layerSimple?.marker, markerAppearanceFields);

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
          const appearanceType = (() => {
            switch (VectorTileFeature.types[mvtFeature.type]) {
              case "Polygon":
                return "polygon";
              case "LineString":
                return "polyline";
              case "Point":
                return "marker";
            }
          })();
          const computedFeature = ((): ComputedFeature | void => {
            const layer = cachedCalculatedLayerRef.current?.layer;
            if (layer?.type !== "simple") {
              return;
            }
            const feature = makeFeature("", mvtFeature, tile, appearanceType);
            if (feature) {
              return evalFeature?.(layer, feature);
            }
          })();

          const style = (() => {
            if (appearanceType === "polygon") {
              const polygon = computedFeature?.polygon;
              return {
                fillStyle:
                  (polygon?.fill ?? true) && (polygon?.show ?? true)
                    ? polygon?.fillColor
                    : "rgba(0,0,0,0)", // hide the feature
                strokeStyle:
                  polygon?.stroke && (polygon?.show ?? true)
                    ? polygon?.strokeColor
                    : "rgba(0,0,0,0)", // hide the feature
                lineWidth: polygon?.strokeWidth,
                lineJoin: polygon?.lineJoin,
              };
            }
            if (appearanceType === "polyline") {
              const polyline = computedFeature?.polyline;
              return {
                fillStyle:
                  (polyline?.strokeColor ?? true) && (polyline?.show ?? true)
                    ? polyline?.strokeColor
                    : "rgba(0,0,0,0)", // hide the feature
                strokeStyle:
                  polyline?.strokeColor && (polyline?.show ?? true)
                    ? polyline?.strokeColor
                    : "rgba(0,0,0,0)", // hide the feature
                lineWidth: polyline?.strokeWidth,
              };
            }
            if (appearanceType === "marker") {
              const marker = computedFeature?.marker;
              return {
                fillStyle:
                  (marker?.pointColor ?? true) && (marker?.show ?? true)
                    ? marker?.pointColor
                    : "rgba(0,0,0,0)", // hide the feature
                strokeStyle:
                  marker?.pointColor && (marker?.show ?? true)
                    ? marker?.pointColor
                    : "rgba(0,0,0,0)", // hide the feature
                lineWidth: marker?.pointSize,
              };
            }
            return;
          })();
          cachedStyleMap.set(styleCacheKey, style);
          return style;
        },
        onSelectFeature: (mvtFeature, tile) => {
          const layer = extractSimpleLayer(cachedCalculatedLayerRef.current?.layer);
          if (!layer) {
            return;
          }
          const appearanceType = (() => {
            switch (VectorTileFeature.types[mvtFeature.type]) {
              case "Polygon":
                return "polygon";
              case "LineString":
                return "polyline";
              case "Point":
                return "marker";
            }
          })();
          const id = mvtFeature.id
            ? String(mvtFeature.id)
            : idFromGeometry(mvtFeature.loadGeometry(), tile);
          const feature = evalFeature(layer, makeFeature(id, mvtFeature, tile, appearanceType));
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

const idFromGeometry = (
  geometry: ReturnType<VectorTileFeature["loadGeometry"]>,
  tile: TileCoords,
) => {
  const id = [tile.x, tile.y, tile.level, ...geometry.flatMap(i => i.map(j => [j.x, j.y]))].join(
    ":",
  );

  return generateIDWithMD5(id);
};

const makeFeature = (
  id: string,
  feature: VectorTileFeature,
  tile: TileCoords,
  appearance: "polygon" | "polyline" | "marker",
): Feature => {
  const geometry = feature.loadGeometry();
  const [type, coordinates] = (() => {
    if (appearance === "polygon") {
      return [
        "Polygon" as Polygon["type"],
        geometry.map(points => points.map(p => [p.x, p.y])) as Polygon["coordinates"],
      ];
    }
    if (appearance === "polyline") {
      return [
        "LineString" as LineString["type"],
        geometry[0].map(p => [p.x, p.y]) as LineString["coordinates"],
      ];
    }
    if (appearance === "marker") {
      return [
        "Point" as Point["type"],
        [geometry[0][0].x, geometry[0][0].y] as Point["coordinates"],
      ];
    }

    throw new Error(`Unexpected appearance ${appearance}`);
  })();
  return {
    type: "feature",
    id,
    geometry: {
      type,
      coordinates,
    } as Geometry,
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

const polylineAppearanceFields: (keyof PolylineAppearance)[] = [
  "show",
  "strokeColor",
  "strokeWidth",
];

const markerAppearanceFields: (keyof MarkerAppearance)[] = ["show", "pointColor", "pointSize"];
