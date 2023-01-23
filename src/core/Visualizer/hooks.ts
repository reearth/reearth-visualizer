import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useWindowSize } from "react-use";

import { type DropOptions, useDrop } from "@reearth/util/use-dnd";

import type { ComputedFeature, Feature } from "../mantle";
import type {
  Ref as MapRef,
  LayerSelectionReason,
  Camera,
  Clock,
  ComputedLayer,
  SceneProperty,
} from "../Map";
import { useOverriddenProperty } from "../Map";

import useViewport from "./useViewport";

const viewportMobileMaxWidth = 768;

export default function useHooks({
  selectedBlockId: initialSelectedBlockId,
  camera: initialCamera,
  clock: initialClock,
  sceneProperty,
  isEditable,
  rootLayerId,
  onLayerSelect,
  onBlockSelect,
  onCameraChange,
  onTick,
}: {
  selectedBlockId?: string;
  camera?: Camera;
  clock?: Date;
  isEditable?: boolean;
  rootLayerId?: string;
  sceneProperty?: SceneProperty;
  onLayerSelect?: (
    layerId: string | undefined,
    featureId: string | undefined,
    layer: (() => Promise<ComputedLayer | undefined>) | undefined,
    reason: LayerSelectionReason | undefined,
  ) => void;
  onBlockSelect?: (blockId?: string) => void;
  onCameraChange?: (camera: Camera) => void;
  onTick?: (clock: Date) => void;
}) {
  const mapRef = useRef<MapRef>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const { ref: dropRef, isDroppable } = useDrop(
    useMemo(
      (): DropOptions => ({
        accept: ["primitive"],
        drop(_item, context) {
          if (!rootLayerId || !isEditable) return;
          const loc = context.position
            ? mapRef.current?.engine.getLocationFromScreen(context.position.x, context.position.y)
            : undefined;
          return {
            type: "earth",
            layerId: rootLayerId,
            position: loc ? { lat: loc.lat, lng: loc.lng, height: loc.height } : undefined,
          };
        },
        wrapperRef,
      }),
      [rootLayerId, isEditable],
    ),
  );
  dropRef(wrapperRef);

  const viewport = useViewport({
    wrapperRef,
  });

  // layer
  const [selectedLayer, selectLayer] = useState<{
    layerId?: string;
    featureId?: string;
    layer?: ComputedLayer;
    reason?: LayerSelectionReason;
  }>({});
  const [selectedFeature, selectFeature] = useState<Feature>();
  const [selectedComputedFeature, selectComputedFeature] = useState<ComputedFeature>();
  useEffect(() => {
    const { layerId, featureId, layer, reason } = selectedLayer;
    onLayerSelect?.(layerId, featureId, async () => layer, reason);
  }, [onLayerSelect, selectedLayer]);
  const handleLayerSelect = useCallback(
    async (
      layerId: string | undefined,
      featureId: string | undefined,
      layer: (() => Promise<ComputedLayer | undefined>) | undefined,
      reason: LayerSelectionReason | undefined,
    ) => {
      const computedLayer = await layer?.();

      selectFeature(computedLayer?.originalFeatures.find(f => f.id === featureId));
      selectComputedFeature(computedLayer?.features.find(f => f.id === featureId));

      selectLayer({ layerId, featureId, layer: computedLayer, reason });
    },
    [],
  );

  // scene
  const [overriddenSceneProperty, overrideSceneProperty] = useOverriddenProperty(sceneProperty);

  // block
  const [selectedBlock, selectBlock] = useValue(initialSelectedBlockId, onBlockSelect);

  // camera
  const [camera, changeCamera] = useValue(initialCamera, onCameraChange);

  // clock
  const [clock, handleTick] = useValue(initialClock, onTick);
  const handleTick2 = useCallback((clock: Clock) => handleTick(clock.current), [handleTick]);
  const mapClock = useMemo<Clock | undefined>(
    () => (clock ? { current: clock } : undefined),
    [clock],
  );

  // mobile
  const { width } = useWindowSize();
  const isMobile = width < viewportMobileMaxWidth;

  return {
    mapRef,
    wrapperRef,
    selectedLayer: selectedLayer,
    selectedFeature,
    selectedComputedFeature,
    selectedBlock,
    viewport,
    camera,
    clock: mapClock,
    isMobile,
    overriddenSceneProperty,
    isDroppable,
    handleLayerSelect,
    handleBlockSelect: selectBlock,
    handleCameraChange: changeCamera,
    handleTick: handleTick2,
    overrideSceneProperty,
  };
}

function useValue<T>(
  initial: T | undefined,
  onChange: ((t: T) => void) | undefined,
): [T | undefined, Dispatch<SetStateAction<T | undefined>>] {
  const [state, set] = useState(initial);

  useEffect(() => {
    if (state) {
      onChange?.(state);
    }
  }, [state, onChange]);

  useEffect(() => {
    set(initial);
  }, [initial]);

  return [state, set];
}
