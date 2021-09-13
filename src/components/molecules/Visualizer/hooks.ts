import { useRef, useEffect, useMemo, useState, useCallback, RefObject } from "react";
import { initialize, pageview } from "react-ga";

import { useDrop, DropOptions } from "@reearth/util/use-dnd";
import { Camera } from "@reearth/util/value";

import api from "./api";
import { VisualizerContext } from "./context";
import type {
  OverriddenInfobox,
  Ref as EngineRef,
  SceneProperty,
  SelectPrimitiveOptions,
} from "./Engine";
import type { Props as InfoboxProps, Block } from "./Infobox";

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

  const {
    selectedPrimitive,
    selectedPrimitiveId,
    primitiveSelectionReason,
    primitiveOverridenInfobox,
    infobox,
    selectPrimitive,
  } = usePrimitiveSelection({
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
    initialize(trackingId);
    pageview(window.location.pathname);
  }, [isPublished, enableGA, trackingId]);

  const visualizerContext = useVisualizerContext({
    engine: engineRef,
    primitives,
    camera: innerCamera,
    selectedPrimitive,
    primitiveSelectionReason,
    primitiveOverridenInfobox,
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
    infobox,
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
  infobox?: Pick<
    InfoboxProps,
    "infoboxKey" | "title" | "blocks" | "visible" | "property" | "primitive" | "isEditable"
  >;
  primitiveOverridenInfobox?: OverriddenInfobox;
  onPrimitiveSelect?: (id?: string, options?: SelectPrimitiveOptions) => void;
}) {
  const [selectedPrimitiveId, innerSelectPrimitive] = useState<string | undefined>();
  const [primitiveSelectionReason, setSelectionReason] = useState<string | undefined>();
  const [primitiveOverridenInfobox, setPrimitiveOverridenInfobox] = useState<OverriddenInfobox>();

  const selectedPrimitive = useMemo(
    () => (selectedPrimitiveId ? primitives?.find(p => p.id === selectedPrimitiveId) : undefined),
    [selectedPrimitiveId, primitives],
  );

  const selectPrimitive = useCallback(
    (id?: string, { reason, overriddenInfobox }: SelectPrimitiveOptions = {}) => {
      innerSelectPrimitive(id);
      onPrimitiveSelect?.(id);
      setSelectionReason(reason);
      setPrimitiveOverridenInfobox(overriddenInfobox);
    },
    [onPrimitiveSelect],
  );

  const blocks = useMemo(
    (): Block[] | undefined => overridenInfoboxBlocks(primitiveOverridenInfobox),
    [primitiveOverridenInfobox],
  );

  const infobox = useMemo<
    | Pick<
        InfoboxProps,
        "infoboxKey" | "title" | "blocks" | "visible" | "property" | "primitive" | "isEditable"
      >
    | undefined
  >(
    () =>
      selectedPrimitive
        ? {
            infoboxKey: selectedPrimitive.id,
            title: primitiveOverridenInfobox?.title || selectedPrimitive.title,
            isEditable: !primitiveOverridenInfobox && selectedPrimitive.infoboxEditable,
            visible: !!selectedPrimitive?.infobox,
            property: selectedPrimitive?.infobox?.property,
            primitive: selectedPrimitive,
            blocks: blocks ?? selectedPrimitive.infobox?.blocks,
          }
        : undefined,
    [selectedPrimitive, primitiveOverridenInfobox, blocks],
  );

  useEffect(() => {
    innerSelectPrimitive(outerSelectedPrimitiveId);
    setSelectionReason(undefined);
    setPrimitiveOverridenInfobox(undefined);
  }, [outerSelectedPrimitiveId]);

  return {
    selectedPrimitive,
    selectedPrimitiveId,
    primitiveSelectionReason,
    infobox,
    primitiveOverridenInfobox,
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
  primitiveOverridenInfobox,
  showPrimitive,
  hidePrimitive,
  selectPrimitive,
}: {
  engine: RefObject<EngineRef>;
  camera?: Camera;
  primitives?: Primitive[];
  selectedPrimitive: Primitive | undefined;
  primitiveSelectionReason?: string;
  primitiveOverridenInfobox?: OverriddenInfobox;
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
      primitiveOverridenInfobox,
      pluginAPI,
    };
  }, [
    camera,
    engine,
    pluginAPI,
    primitives,
    selectedPrimitive,
    primitiveSelectionReason,
    primitiveOverridenInfobox,
  ]);

  return ctx;
}

function overridenInfoboxBlocks(
  overriddenInfobox: OverriddenInfobox | undefined,
): Block[] | undefined {
  return overriddenInfobox && Array.isArray(overriddenInfobox?.content)
    ? [
        {
          id: "content",
          pluginId: "reearth",
          extensionId: "dlblock",
          property: {
            items: overriddenInfobox.content.map((c, i) => ({
              id: i,
              item_title: c.key,
              item_datastr: String(c.value),
              item_datatype: "string",
            })),
          },
        },
      ]
    : undefined;
}
