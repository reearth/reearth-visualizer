import { VectorTileFeature } from "@mapbox/vector-tile";
import {
  ImageryLayerCollection,
  ImageryLayerFeatureInfo,
  ImageryProvider,
  WebMapServiceImageryProvider,
} from "cesium";
import { MVTImageryProvider } from "cesium-mvt-imagery-provider";
import { useEffect, useMemo, useRef } from "react";
import { useCesium } from "resium";

import type {
  ComputedFeature,
  ComputedLayer,
  Feature,
  PolygonAppearance,
  RasterAppearance,
} from "../../..";
import { usePick } from "../hooks";
import { attachTag, extractSimpleLayer, extractSimpleLayerData, generateIDWithMD5 } from "../utils";

import { Props } from "./types";

const useImageryProvider = (
  imageryProvider: ImageryProvider | undefined,
  layerId: string | undefined,
  property: RasterAppearance | undefined,
) => {
  const { viewer } = useCesium();
  const alpha = property?.alpha;
  useEffect(() => {
    if (!imageryProvider || !viewer) return;
    const imageryLayers: ImageryLayerCollection = viewer.imageryLayers;
    const imageryLayer = imageryLayers.addImageryProvider(imageryProvider);
    if (alpha !== undefined && typeof alpha === "number") {
      imageryLayer.alpha = alpha;
    }
    attachTag(imageryLayer, { layerId });
    return () => {
      imageryLayers.remove(imageryLayer);
    };
  }, [imageryProvider, viewer, layerId, alpha]);
};

const useData = (layer: ComputedLayer | undefined) => {
  return useMemo(() => {
    const data = extractSimpleLayerData(layer);
    return {
      type: data?.type,
      url: data?.url,
      layers: data?.layers
        ? Array.isArray(data.layers)
          ? data.layers.join(",")
          : data?.layers
        : undefined,
      parameters: data?.parameters,
    };
  }, [layer]);
};

export const useWMS = ({
  isVisible,
  property,
  layer,
}: Pick<Props, "isVisible" | "property" | "layer">) => {
  const { show = true, minimumLevel, maximumLevel, credit } = property ?? {};
  const { type, url, layers, parameters } = useData(layer);

  const imageryProvider = useMemo(() => {
    if (!isVisible || !show || !url || !layers || type !== "wms") return;
    return new WebMapServiceImageryProvider({
      url,
      layers,
      minimumLevel,
      maximumLevel,
      credit,
      parameters,
    });
  }, [isVisible, show, url, layers, type, minimumLevel, maximumLevel, credit, parameters]);

  useImageryProvider(imageryProvider, layer?.id, property);
};

type TileCoords = { x: number; y: number; level: number };

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
        urlTemplate: url as `http${"s" | ""}://${string}/{z}/{x}/{y}${string}`,
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
          info.data = { layerId: layer?.id, featureId: id, feature };
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

const polygonAppearanceFields: (keyof PolygonAppearance)[] = [
  "show",
  "fill",
  "fillColor",
  "stroke",
  "strokeColor",
  "strokeWidth",
  "lineJoin",
];
