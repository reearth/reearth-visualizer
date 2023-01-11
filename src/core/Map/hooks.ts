import { useImperativeHandle, useRef, type Ref, useState, useCallback, useEffect } from "react";

import { type MapRef, mapRef } from "./ref";
import type { EngineRef, LayersRef, Layer, LayerSelectionReason } from "./types";

export type { MapRef } from "./ref";

export default function ({
  ref,
  onLayerSelect,
}: {
  ref: Ref<MapRef>;
  selectedLayerId?: string;
  onLayerSelect?: (
    id: string | undefined,
    layer: Layer | undefined,
    options?: LayerSelectionReason,
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

  const [selectedLayer, selectLayer] = useState<
    [string | undefined, Layer | undefined, LayerSelectionReason | undefined]
  >([undefined, undefined, undefined]);

  const handleLayerSelect = useCallback(
    (id: string | undefined, layer: Layer | undefined, reason?: LayerSelectionReason) => {
      selectLayer([id, layer, reason]);
    },
    [],
  );

  const handleEngineLayerSelect = useCallback(
    (id: string | undefined, reason?: LayerSelectionReason) => {
      layersRef.current?.select(id, reason);
    },
    [],
  );

  useEffect(() => {
    onLayerSelect?.(selectedLayer[0], selectedLayer[1], selectedLayer[2]);
  }, [onLayerSelect, selectedLayer]);

  return {
    engineRef,
    layersRef,
    selectedLayer,
    handleLayerSelect,
    handleEngineLayerSelect,
  };
}
