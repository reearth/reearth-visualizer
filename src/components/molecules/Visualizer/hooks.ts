import { useRef, useEffect, useMemo, useState, useCallback, RefObject } from "react";
import ReactGA from "react-ga";

import { useDrop, DropOptions } from "@reearth/util/use-dnd";
import { Camera } from "@reearth/util/value";
import { VisualizerContext } from "./context";
import api from "./api";
import type { Ref as EngineRef, SceneProperty } from "./Engine";
import type { Primitive } from ".";

export default ({
  engineType,
  rootLayerId,
  isEditable,
  isBuilt,
  isPublished,
  primitives,
  selectedPrimitiveId: outerSelectedPrimitiveId,
  selectedBlockId: outerSelectedBlockId,
  camera,
  sceneProperty,
  onPrimitiveSelect,
  onBlockSelect,
  onCameraChange,
}: {
  engineType?: string;
  rootLayerId?: string;
  isEditable?: boolean;
  isBuilt?: boolean;
  isPublished?: boolean;
  primitives?: Primitive[];
  selectedPrimitiveId?: string;
  selectedBlockId?: string;
  camera?: Camera;
  sceneProperty?: SceneProperty;
  onPrimitiveSelect?: (id?: string) => void;
  onBlockSelect?: (id?: string) => void;
  onCameraChange?: (c: Camera) => void;
}) => {
  const engineRef = useRef<EngineRef>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const { ref: dropRef, isDroppable } = useDrop(
    useMemo(
      (): DropOptions => ({
        accept: ["primitive", "datasetSchema"],
        drop(_item, context) {
          if (!rootLayerId || !isEditable) return;
          const loc = context.position
            ? engineRef.current?.getLocationFromScreenXY(context.position.x, context.position.y)
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

  const { selectedPrimitive, selectedPrimitiveId, primitiveSelectionReason, selectPrimitive } =
    usePrimitiveSelection({
      primitives,
      selectedPrimitiveId: outerSelectedPrimitiveId,
      onPrimitiveSelect,
    });

  const [selectedBlockId, selectBlock] = useInnerState<string>(outerSelectedBlockId, onBlockSelect);

  useEffect(() => {
    if (!isEditable || !isBuilt) {
      selectBlock();
    }
  }, [isEditable, isBuilt, selectBlock]);

  // update cesium
  useEffect(() => {
    engineRef.current?.requestRender();
  });

  const [innerCamera, setInnerCamera] = useState(camera);
  useEffect(() => {
    setInnerCamera(camera);
  }, [camera]);
  const updateCamera = useCallback(
    (camera: Camera) => {
      setInnerCamera(camera);
      onCameraChange?.(camera);
    },
    [onCameraChange],
  );

  const hiddenPrimitivesSet = useMemo(() => new Set<string>(), []);
  const [hiddenPrimitives, setHiddenPrimitives] = useState<string[]>([]);
  const showPrimitive = useCallback(
    (...ids: string[]) => {
      for (const id of ids) {
        hiddenPrimitivesSet.delete(id);
      }
      setHiddenPrimitives(Array.from(hiddenPrimitivesSet.values()));
    },
    [hiddenPrimitivesSet],
  );
  const hidePrimitive = useCallback(
    (...ids: string[]) => {
      for (const id of ids) {
        hiddenPrimitivesSet.add(id);
      }
      setHiddenPrimitives(Array.from(hiddenPrimitivesSet.values()));
    },
    [hiddenPrimitivesSet],
  );

  const { enableGA, trackingId } = sceneProperty?.googleAnalytics || {};
  useEffect(() => {
    if (!isPublished || !enableGA || !trackingId) return;
    ReactGA.initialize(trackingId);
    ReactGA.pageview(window.location.pathname);
  }, [isPublished, enableGA, trackingId]);

  const visualizerContext = useVisualizerContext({
    engine: engineRef,
    primitives,
    camera: innerCamera,
    selectedPrimitive,
    primitiveSelectionReason,
    selectPrimitive,
    showPrimitive,
    hidePrimitive,
  });

  useEffect(() => {
    const c = engineRef.current?.getCamera();
    if (c) {
      setInnerCamera(c);
    }
  }, [engineType]);

  return {
    engineRef,
    wrapperRef,
    isDroppable,
    visualizerContext,
    hiddenPrimitives,
    selectedPrimitiveId,
    primitiveSelectionReason,
    selectedPrimitive,
    selectedBlockId,
    innerCamera,
    selectPrimitive,
    selectBlock,
    updateCamera,
  };
};

function usePrimitiveSelection({
  primitives,
  selectedPrimitiveId: outerSelectedPrimitiveId,
  onPrimitiveSelect,
}: {
  primitives?: Primitive[];
  selectedPrimitiveId?: string;
  onPrimitiveSelect?: (id?: string) => void;
}) {
  const [selectedPrimitiveId, innerSelectPrimitive] = useState<string | undefined>();
  const [primitiveSelectionReason, setSelectionReason] = useState<string | undefined>();

  const selectedPrimitive = useMemo(
    () => (selectedPrimitiveId ? primitives?.find(p => p.id === selectedPrimitiveId) : undefined),
    [selectedPrimitiveId, primitives],
  );

  const selectPrimitive = useCallback(
    (id?: string, { reason }: { reason?: string } = {}) => {
      innerSelectPrimitive(id);
      onPrimitiveSelect?.(id);
      setSelectionReason(reason);
    },
    [onPrimitiveSelect],
  );

  useEffect(() => {
    innerSelectPrimitive(outerSelectedPrimitiveId);
    setSelectionReason(undefined);
  }, [outerSelectedPrimitiveId]);

  return {
    selectedPrimitive,
    selectedPrimitiveId,
    primitiveSelectionReason,
    selectPrimitive,
  };
}

function useInnerState<T>(
  value: T | undefined,
  onChange: ((value?: T) => void) | undefined,
): readonly [T | undefined, (value?: T) => void] {
  const [innerState, innerSetState] = useState<T>();

  const setState = useCallback(
    (newValue?: T) => {
      innerSetState(newValue);
      onChange?.(newValue);
    },
    [onChange],
  );

  useEffect(() => {
    innerSetState(value);
  }, [value]);

  return [innerState, setState];
}

function useVisualizerContext({
  engine,
  camera,
  primitives = [],
  selectedPrimitive,
  primitiveSelectionReason,
  showPrimitive,
  hidePrimitive,
  selectPrimitive,
}: {
  engine: RefObject<EngineRef>;
  camera?: Camera;
  primitives?: Primitive[];
  selectedPrimitive: Primitive | undefined;
  primitiveSelectionReason?: string;
  showPrimitive: (...id: string[]) => void;
  hidePrimitive: (...id: string[]) => void;
  selectPrimitive: (id?: string, options?: { reason?: string }) => void;
}): VisualizerContext {
  const pluginAPI = useMemo(
    () =>
      api({
        engine: () => engine.current,
        hidePrimitive,
        selectPrimitive,
        showPrimitive,
      }),
    [engine, hidePrimitive, selectPrimitive, showPrimitive],
  );

  const ctx = useMemo((): VisualizerContext => {
    return {
      engine: engine.current ?? undefined,
      camera,
      primitives,
      selectedPrimitive,
      primitiveSelectionReason,
      pluginAPI,
    };
  }, [camera, engine, pluginAPI, primitives, selectedPrimitive, primitiveSelectionReason]);

  return ctx;
}
