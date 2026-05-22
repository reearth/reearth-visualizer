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
import { migrateViewerPropertyTiles } from "./utils/tilesMigration";

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

  // Apply overrides first
  const [overriddenViewerProperty, overrideViewerProperty] =
    useOverriddenProperty(viewerProperty);

  // Apply migration (backward compatibility) and fallback:
  // Migration: Deprecated tile types → new types (EE), default tile/terrain types
  // Fallback: Cesium Ion assets → alternatives when token missing
  const migratedViewerProperty = useMemo(() => {
    const configData = config();
    const isEE = configData?.featureCollection === "ee";
    const defaultTileType = appFeature()?.defaultTileType;
    const hasAccessToken = !!engineMeta?.cesiumIonAccessToken;

    return migrateViewerPropertyTiles(overriddenViewerProperty, {
      isEE,
      defaultTileType,
      hasAccessToken
    });
  }, [overriddenViewerProperty, engineMeta]);

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
    overriddenViewerProperty: migratedViewerProperty,
    overrideViewerProperty,
    storyWrapperRef,
    visualizerCamera,
    handleCoreLayerSelect,
    mapAPIReady,
    onCoreAPIReady,
    currentCameraRef
  };
}
