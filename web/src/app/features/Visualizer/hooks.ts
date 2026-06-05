import { ViewerProperty } from "@reearth/app/features/Editor/Visualizer/type";
import { Camera } from "@reearth/app/utils/value";
import { ComputedFeature, ComputedLayer, TileProperty } from "@reearth/core";
import { config } from "@reearth/services/config";
import { appFeature } from "@reearth/services/config/appFeatureConfig";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

import { useVisualizerCamera } from "./atoms";
import { BuiltinWidgets } from "./Crust";
import { InternalWidget } from "./Crust/Widgets";
import { getBuiltinWidgetOptions } from "./Crust/Widgets/Widget";
import { useOverriddenProperty } from "./utils";
import { migrateViewerPropertyTiles } from "./utils/tilesMigration";

export default function useHooks({
  ownBuiltinWidgets,
  viewerProperty,
  widgets,
  onCoreLayerSelect,
  currentCamera,
  handleCoreAPIReady,
  engineMeta
}: {
  ownBuiltinWidgets?: (keyof BuiltinWidgets)[];
  viewerProperty?: ViewerProperty;
  widgets?: InternalWidget[];
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

  // Apply migration (backward compatibility) and fallback
  // Migration: Deprecated tile types → new types (EE), default tile/terrain types
  // Fallback: Cesium Ion assets → alternatives when token missing
  // Note: Migration maps are defined in utils/tilesMigration.ts
  const migratedViewerProperty = useMemo(() => {
    const configData = config();
    const isEE = configData?.featureCollection === "ee";
    const defaultTileType = appFeature()?.defaultTileType;

    // Check both global token override and engineMeta token
    // Validate tokens are non-empty strings
    const globalToken = overriddenViewerProperty?.assets?.cesium?.global?.ionAccessToken;
    const engineToken = engineMeta?.cesiumIonAccessToken;
    const hasAccessToken = !!(
      (typeof globalToken === "string" && globalToken.trim().length > 0) ||
      (typeof engineToken === "string" && engineToken.trim().length > 0)
    );

    return migrateViewerPropertyTiles(overriddenViewerProperty, {
      isEE,
      defaultTileType,
      defaultTerrainType: "reearth_terrain",
      hasAccessToken
    });
  }, [overriddenViewerProperty, engineMeta]);

  const streetViewTiles = useMemo(() => {
    const streetViewWidget = widgets?.find(
      (w) => w.extensionId === "streetView"
    );
    if (!streetViewWidget?.property) return [];

    const property = streetViewWidget.property as Record<string, unknown>;

    // Editor (GQL): property has raw items array
    if (Array.isArray(property["items"])) {
      return (
        property["items"] as {
          id: string;
          schemaGroupId?: string;
          fields?: { fieldId: string; value?: unknown }[];
        }[]
      ).flatMap((item) => {
        if (item.schemaGroupId !== "tiles" || !item.fields) return [];
        const type = item.fields.find((f) => f.fieldId === "tile_type")
          ?.value as string | undefined;
        if (!type) return [];
        return [{ id: item.id, type }];
      });
    }

    // Published: property is already processed as { tiles: { tile_type } }
    const tileType = (property["tiles"] as { tile_type?: string } | undefined)
      ?.tile_type;
    if (!tileType) return [];
    return [{ id: streetViewWidget.id, type: tileType }];
  }, [widgets]);


  // Append Street View tile when Street View widget exists and has a tile type selected
  const finalViewerProperty = useMemo(() => {
    if (!streetViewTiles?.length || !migratedViewerProperty)
      return migratedViewerProperty;

    const newTiles: TileProperty[] = streetViewTiles.map(
      (t: { id: string; type: string }) => ({
        id: t.id,
        type: t.type
      })
    );

    return {
      ...migratedViewerProperty,
      tiles: [...(migratedViewerProperty.tiles ?? []), ...newTiles]
    };
  }, [migratedViewerProperty, streetViewTiles]);

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
    overriddenViewerProperty: finalViewerProperty,
    overrideViewerProperty,
    storyWrapperRef,
    visualizerCamera,
    handleCoreLayerSelect,
    mapAPIReady,
    onCoreAPIReady,
    currentCameraRef
  };
}