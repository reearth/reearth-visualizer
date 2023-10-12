import { useImperativeHandle, useRef, type Ref, useState, useCallback, useEffect } from "react";

import { SelectedFeatureInfo } from "../mantle";

import { type MapRef, mapRef } from "./ref";
import type {
  EngineRef,
  LayersRef,
  LayerSelectionReason,
  ComputedLayer,
  RequestingRenderMode,
  SceneProperty,
} from "./types";
import useTimelineManager, { TimelineManagerRef } from "./useTimelineManager";

export type { MapRef } from "./ref";

export const FORCE_REQUEST_RENDER = -1;
export const NO_REQUEST_RENDER = 0;
export const REQUEST_RENDER_ONCE = 1;

export default function ({
  ref,
  sceneProperty,
  timelineManagerRef,
  onLayerSelect,
  zoomedLayerId,
  onZoomToLayer,
}: {
  ref: Ref<MapRef>;
  selectedLayerId?: {
    layerId?: string;
    featureId?: string;
  };
  sceneProperty?: SceneProperty;
  timelineManagerRef?: TimelineManagerRef;
  onLayerSelect?: (
    layerId: string | undefined,
    featureId: string | undefined,
    layer: (() => Promise<ComputedLayer | undefined>) | undefined,
    options?: LayerSelectionReason,
    info?: SelectedFeatureInfo,
  ) => void;
  zoomedLayerId?: string;
  onZoomToLayer?: (layerId: string | undefined) => void;
}) {
  const engineRef = useRef<EngineRef>(null);
  const layersRef = useRef<LayersRef>(null);
  const requestingRenderMode = useRef<RequestingRenderMode>(NO_REQUEST_RENDER);

  useImperativeHandle(
    ref,
    () =>
      mapRef({
        engineRef,
        layersRef,
        timelineManagerRef,
      }),
    [timelineManagerRef],
  );

  // Order in which selectedLayerId prop propagates from the outside: Map -> Layers -> Engine
  // 1. selectedLayerId prop on Map component
  // 2. selectedLayerId prop on Layer component
  // 3. onLayerSelect event on Layer component
  // 4. handleLayerSelect fucntion
  // 5. selectedLayer state
  // 6. selectedLayerId prop on Engine component, onLayerSelect event on Layer component
  // 7. onLayerSelect event on Map component

  const [selectedLayer, selectLayer] = useState<{
    layerId?: string;
    featureId?: string;
    layer?: ComputedLayer;
    reason?: LayerSelectionReason;
    info?: SelectedFeatureInfo;
  }>({});

  const handleLayerSelect = useCallback(
    async (
      layerId: string | undefined,
      featureId: string | undefined,
      layer: (() => Promise<ComputedLayer | undefined>) | undefined,
      reason?: LayerSelectionReason,
      info?: SelectedFeatureInfo,
    ) => {
      console.log("handleLayerSelect");
      selectLayer({ layerId, featureId, layer: await layer?.(), reason, info });
    },
    [],
  );

  const handleEngineLayerSelect = useCallback(
    (
      layerId: string | undefined,
      featureId?: string,
      reason?: LayerSelectionReason,
      info?: SelectedFeatureInfo,
    ) => {
      layersRef.current?.selectFeatures(
        [{ layerId, featureId: featureId ? [featureId] : undefined }],
        reason,
        info,
      );
    },
    [],
  );

  useEffect(() => {
    onLayerSelect?.(
      selectedLayer.layerId,
      selectedLayer.featureId,
      async () => selectedLayer.layer,
      selectedLayer.reason,
      selectedLayer.info,
    );
  }, [onLayerSelect, selectedLayer]);

  useEffect(() => {
    if (zoomedLayerId) {
      engineRef.current?.lookAtLayer(zoomedLayerId);
      onZoomToLayer?.(undefined);
    }
  }, [zoomedLayerId, onZoomToLayer]);

  useTimelineManager({
    init: sceneProperty?.timeline,
    engineRef,
    timelineManagerRef,
  });

  return {
    engineRef,
    layersRef,
    selectedLayer,
    requestingRenderMode,
    handleLayerSelect,
    handleEngineLayerSelect,
  };
}
