import { ViewerProperty } from "@reearth/app/features/Editor/Visualizer/type";
import { Camera } from "@reearth/app/utils/value";
import { ComputedFeature, ComputedLayer } from "@reearth/core";
import { config } from "@reearth/services/config";
import { appFeature } from "@reearth/services/config/appFeatureConfig";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

import { useVisualizerCamera } from "./atoms";
import { BuiltinWidgets } from "./Crust";
import { getBuiltinWidgetOptions } from "./Crust/Widgets/Widget";
import { useOverriddenProperty } from "./utils";

export default function useHooks({
  ownBuiltinWidgets,
  viewerProperty,
  onCoreLayerSelect,
  currentCamera,
  handleCoreAPIReady,
  engineMeta
}: {
  ownBuiltinWidgets?: (keyof BuiltinWidgets)[];
  viewerProperty?: ViewerProperty;
  onCoreLayerSelect?: (
    layerId: string | undefined,
    layer: ComputedLayer | undefined,
    feature: ComputedFeature | undefined
  ) => void;
  currentCamera?: Camera;
  handleCoreAPIReady?: () => void;
  engineMeta?: {
    cesiumIonAccessToken: string | undefined;
  };
}) {
  const shouldRender = useMemo(() => {
    const shouldWidgetAnimate = ownBuiltinWidgets?.some(
      (id) => !!getBuiltinWidgetOptions(id).animation
    );
    return shouldWidgetAnimate;
  }, [ownBuiltinWidgets]);

  // Apply backward compatibility for tiles when featureCollection is 'ee'
  // Also apply default tile type for tiles without explicit type
  const migratedViewerProperty = useMemo(() => {
    if (!viewerProperty?.tiles) return viewerProperty;

    const configData = config();
    const isEE = configData?.featureCollection === "ee";
    const defaultTileType = appFeature()?.defaultTileType;

    // Mapping of deprecated tile types to EE tile types
    const tileTypeMigrationMap: Record<string, string> = {
      default: "google_satellite",
      default_label: "google_satellite",
      default_road: "google_roadmap",
      black_marble: "nasa_black_marble"
    };

    // Mapping of Cesium Ion asset IDs to EE tile types (fallback when no token provided)
    const cesiumIonAssetIdFallbackMap: Record<string, string> = {
      "2": "google_satellite",
      "3": "google_satellite",
      "4": "google_roadmap",
      "3812": "nasa_black_marble"
    };

    const hasAccessToken = !!engineMeta?.cesiumIonAccessToken;

    const needsProcessing = viewerProperty.tiles.some((tile) => {
      // Check for tiles without type (need default)
      if (!tile.type) return true;

      // Check for deprecated tile types (EE only)
      if (isEE && tile.type in tileTypeMigrationMap) return true;

      // Check for cesium_ion tiles without token that need fallback (EE only)
      if (
        isEE &&
        tile.type === "cesium_ion" &&
        !hasAccessToken &&
        // @ts-expect-error - cesiumIonAssetId will be added to core type later
        tile.cesiumIonAssetId &&
        // @ts-expect-error - cesiumIonAssetId will be added to core type later
        tile.cesiumIonAssetId in cesiumIonAssetIdFallbackMap
      ) {
        return true;
      }

      return false;
    });

    if (!needsProcessing) return viewerProperty;

    const migratedTiles = viewerProperty.tiles.map((tile) => {
      // Apply default tile type for tiles without explicit type
      if (!tile.type && defaultTileType) {
        return {
          ...tile,
          type: defaultTileType
        };
      }

      // EE-specific migrations only apply when featureCollection is 'ee'
      if (!isEE) return tile;

      // Migrate deprecated tile types
      if (tile.type && tile.type in tileTypeMigrationMap) {
        return {
          ...tile,
          type: tileTypeMigrationMap[tile.type]
        };
      }

      // Fallback cesium_ion tiles to EE types when no access token provided
      if (tile.type === "cesium_ion" && !hasAccessToken) {
        // @ts-expect-error - cesiumIonAssetId will be added to core type later
        const assetId = tile.cesiumIonAssetId;
        if (assetId && assetId in cesiumIonAssetIdFallbackMap) {
          return {
            ...tile,
            type: cesiumIonAssetIdFallbackMap[assetId]
          };
        }
      }

      return tile;
    });

    return {
      ...viewerProperty,
      tiles: migratedTiles
    };
  }, [viewerProperty, engineMeta]);

  const [overriddenViewerProperty, overrideViewerProperty] =
    useOverriddenProperty(migratedViewerProperty);

  const storyWrapperRef = useRef<HTMLDivElement>(null);

  const handleCoreLayerSelect = useCallback(
    async (
      layerId: string | undefined,
      layer: (() => Promise<ComputedLayer | undefined>) | undefined,
      feature: ComputedFeature | undefined
    ) => {
      onCoreLayerSelect?.(layerId, await layer?.(), feature);
    },
    [onCoreLayerSelect]
  );

  const [visualizerCamera, setVisualizerCamera] = useVisualizerCamera();
  useLayoutEffect(() => {
    setVisualizerCamera(currentCamera);
    return () => {
      setVisualizerCamera(undefined);
    };
  }, [currentCamera, setVisualizerCamera]);
  const currentCameraRef = useRef(currentCamera);
  currentCameraRef.current = currentCamera;

  const [mapAPIReady, setMapAPIReady] = useState(false);
  const onCoreAPIReady = useCallback(() => {
    setMapAPIReady(true);
    handleCoreAPIReady?.();
  }, [handleCoreAPIReady]);

  return {
    shouldRender,
    overriddenViewerProperty,
    overrideViewerProperty,
    storyWrapperRef,
    visualizerCamera,
    handleCoreLayerSelect,
    mapAPIReady,
    onCoreAPIReady,
    currentCameraRef
  };
}
