import { VectorTileFeature } from "@mapbox/vector-tile";
import { ImageryLayerCollection, ImageryProvider, WebMapServiceImageryProvider } from "cesium";
import { MVTImageryProvider } from "cesium-mvt-imagery-provider";
import { useEffect, useMemo, useRef } from "react";
import { useCesium } from "resium";

import type { ComputedFeature, ComputedLayer, Feature } from "../../..";
import { extractSimpleLayerData } from "../utils";

import { Props } from "./types";

const useImageryProvider = (imageryProvider: ImageryProvider | undefined) => {
  const { viewer } = useCesium();
  useEffect(() => {
    if (!imageryProvider) return;
    const imageryLayers: ImageryLayerCollection = viewer.imageryLayers;
    const layer = imageryLayers.addImageryProvider(imageryProvider);
    return () => {
      imageryLayers.remove(layer);
    };
  }, [imageryProvider, viewer]);
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
    };
  }, [layer]);
};

export const useWMS = ({
  isVisible,
  property,
  layer,
}: Pick<Props, "isVisible" | "property" | "layer">) => {
  const { minimumLevel, maximumLevel, credit } = property ?? {};
  const { type, url, layers } = useData(layer);

  const imageryProvider = useMemo(() => {
    if (!isVisible || !url || !layers || type !== "wms") return;
    return new WebMapServiceImageryProvider({
      url,
      layers,
      minimumLevel,
      maximumLevel,
      credit,
    });
  }, [isVisible, type, url, minimumLevel, maximumLevel, credit, layers]);

  useImageryProvider(imageryProvider);
};

type TileCoords = { x: number; y: number; level: number };

const idFromGeometry = (tile: TileCoords) => [tile.x, tile.y, tile.level].join(":");

const makeFeatureFromPolygon = (
  id: string,
  feature: VectorTileFeature,
  tile: TileCoords,
): Feature => {
  const geometry = feature.loadGeometry();
  const coordinates = geometry.map(points => points.map(p => [p.x, p.y]));
  return {
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
}: Pick<Props, "isVisible" | "property" | "layer" | "onFeatureFetch" | "evalFeature">) => {
  const { minimumLevel, maximumLevel, credit } = property ?? {};
  const { type, url, layers } = useData(layer);

  const cachedFeaturesRef = useRef<Map<Feature["id"], Feature>>(new Map());
  const cachedComputedFeaturesRef = useRef<Map<Feature["id"], ComputedFeature>>(new Map());
  const cachedCalculatedLayerRef = useRef(layer);

  const polygonAppearanceFillStyle = layer?.polygon?.fillColor;
  const polygonAppearanceStrokeStyle = layer?.polygon?.strokeColor;
  const polygonAppearanceLineWidth = layer?.polygon?.strokeWidth;
  const polygonAppearanceLineJoin = layer?.polygon?.lineJoin;

  const imageryProvider = useMemo(() => {
    if (!isVisible || !url || !layers || type !== "mvt") return;
    return new MVTImageryProvider({
      minimumLevel,
      maximumLevel,
      credit,
      urlTemplate: url as `http${"s" | ""}://${string}/{z}/{x}/{y}${string}`,
      layerName: layers,
      style: (mvtFeature, tile) => {
        const id = mvtFeature.id ? String(mvtFeature.id) : idFromGeometry(tile);
        const feature = ((): ComputedFeature | void => {
          const layer = cachedCalculatedLayerRef.current?.layer;
          if (layer?.type === "simple" && VectorTileFeature.types[mvtFeature.type] === "Polygon") {
            if (!cachedFeaturesRef.current.has(id)) {
              const feature = makeFeatureFromPolygon(id, mvtFeature, tile);
              cachedFeaturesRef.current.set(id, feature);
              const computedFeature = evalFeature?.(layer, feature);
              if (computedFeature) {
                cachedComputedFeaturesRef.current.set(id, computedFeature);
              }
              return computedFeature;
            } else {
              const feature = cachedFeaturesRef.current.get(id);
              if (
                feature &&
                (polygonAppearanceFillStyle !== feature?.properties.fillColor ||
                  polygonAppearanceStrokeStyle !== feature?.properties.strokeStyle ||
                  polygonAppearanceLineWidth !== feature?.properties.lineWidth ||
                  polygonAppearanceLineJoin !== feature?.properties.lineJoin)
              ) {
                const computedFeature = evalFeature?.(layer, feature);
                if (computedFeature) {
                  cachedComputedFeaturesRef.current.set(id, computedFeature);
                }
              }
              return cachedComputedFeaturesRef.current.get(
                mvtFeature.id ? String(mvtFeature.id) : idFromGeometry(tile),
              );
            }
          }
        })();
        return {
          fillStyle: feature?.polygon?.fillColor,
          strokeStyle: feature?.polygon?.strokeColor,
          lineWidth: feature?.polygon?.strokeWidth,
          lineJoin: feature?.polygon?.lineJoin,
        };
      },
    });
  }, [
    isVisible,
    type,
    url,
    minimumLevel,
    maximumLevel,
    credit,
    layers,
    evalFeature,
    polygonAppearanceFillStyle,
    polygonAppearanceStrokeStyle,
    polygonAppearanceLineWidth,
    polygonAppearanceLineJoin,
  ]);

  useEffect(() => {
    cachedCalculatedLayerRef.current = layer;
  }, [layer]);

  useImageryProvider(imageryProvider);
};
