import { useImperativeHandle, useRef, type Ref, useState, useCallback, useEffect } from "react";

import { SelectedFeatureInfo } from "../mantle";

import { type MapRef, mapRef } from "./ref";
import type { EngineRef, LayersRef, LayerSelectionReason, ComputedLayer } from "./types";

export type { MapRef } from "./ref";

export default function ({
  ref,
  onLayerSelect,
}: {
  ref: Ref<MapRef>;
  selectedLayerId?: {
    layerId?: string;
    featureId?: string;
  };
  onLayerSelect?: (
    layerId: string | undefined,
    featureId: string | undefined,
    layer: (() => Promise<ComputedLayer | undefined>) | undefined,
    options?: LayerSelectionReason,
    info?: SelectedFeatureInfo,
  ) => void;
}) {
  const engineRef = useRef<EngineRef>(null);
  const layersRef = useRef<LayersRef>(null);

  useImperativeHandle(
    ref,
    () =>
      mapRef({
        engineRef,
        layersRef,
      }),
    [],
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
      layersRef.current?.select(layerId, featureId, reason, info);
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

  return {
    engineRef,
    layersRef,
    selectedLayer,
    handleLayerSelect,
    handleEngineLayerSelect,
  };
}
