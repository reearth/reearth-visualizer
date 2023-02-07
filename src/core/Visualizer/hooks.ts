import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWindowSize } from "react-use";

import { type DropOptions, useDrop } from "@reearth/util/use-dnd";

import type { Block } from "../Crust";
import type { ComputedFeature, Feature } from "../mantle";
import type {
  Ref as MapRef,
  LayerSelectionReason,
  Camera,
  ComputedLayer,
  SceneProperty,
  LayerEditEvent,
  OverriddenInfobox,
} from "../Map";
import { useOverriddenProperty } from "../Map";

import useViewport from "./useViewport";

const viewportMobileMaxWidth = 768;

export default function useHooks({
  selectedBlockId: initialSelectedBlockId,
  camera: initialCamera,
  sceneProperty,
  isEditable,
  rootLayerId,
  zoomedLayerId,
  onLayerSelect,
  onBlockSelect,
  onCameraChange,
  onZoomToLayer,
}: {
  selectedBlockId?: string;
  camera?: Camera;
  isEditable?: boolean;
  rootLayerId?: string;
  sceneProperty?: SceneProperty;
  zoomedLayerId?: string;
  onLayerSelect?: (
    layerId: string | undefined,
    featureId: string | undefined,
    layer: (() => Promise<ComputedLayer | undefined>) | undefined,
    reason: LayerSelectionReason | undefined,
  ) => void;
  onBlockSelect?: (blockId?: string) => void;
  onCameraChange?: (camera: Camera) => void;
  onZoomToLayer?: (layerId: string | undefined) => void;
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

  // Infobox
  const overriddenInfobox = selectedLayer.reason?.overriddenInfobox;
  const infobox = useMemo(
    () =>
      selectedLayer
        ? {
            title: overriddenInfobox?.title || selectedLayer.layer?.layer?.title,
            isEditable: !overriddenInfobox && !!selectedLayer.layer?.layer?.infobox,
            visible: !!selectedLayer.layer?.layer?.infobox,
            property: selectedLayer.layer?.layer.infobox?.property?.default,
            blocks:
              overridenInfoboxBlocks(overriddenInfobox) ||
              selectedLayer.layer?.layer.infobox?.blocks?.map(b => ({
                ...b,
                property: b.property.default ?? b.property,
              })),
          }
        : undefined,
    [selectedLayer, overriddenInfobox],
  );

  // scene
  const [overriddenSceneProperty, overrideSceneProperty] = useOverriddenProperty(sceneProperty);

  // block
  const [selectedBlock, selectBlock] = useValue(initialSelectedBlockId, onBlockSelect);

  // camera
  const [camera, changeCamera] = useValue(initialCamera, onCameraChange);

  // mobile
  const { width } = useWindowSize();
  const isMobile = width < viewportMobileMaxWidth;

  // layer edit
  const onLayerEditRef = useRef<(e: LayerEditEvent) => void>();
  const onLayerEdit = useCallback((cb: (e: LayerEditEvent) => void) => {
    onLayerEditRef.current = cb;
  }, []);
  const handleLayerEdit = useCallback((e: LayerEditEvent) => {
    onLayerEditRef.current?.(e);
  }, []);

  // zoom to layer
  useEffect(() => {
    if (zoomedLayerId) {
      mapRef.current?.engine?.lookAtLayer(zoomedLayerId);
      onZoomToLayer?.(undefined);
    }
  }, [zoomedLayerId, onZoomToLayer]);

  return {
    mapRef,
    wrapperRef,
    selectedLayer: selectedLayer,
    selectedFeature,
    selectedComputedFeature,
    selectedBlock,
    viewport,
    camera,
    isMobile,
    overriddenSceneProperty,
    isDroppable,
    infobox,
    handleLayerSelect,
    handleBlockSelect: selectBlock,
    handleCameraChange: changeCamera,
    overrideSceneProperty,
    handleLayerEdit,
    onLayerEdit,
  };
}

function useValue<T>(
  initial: T | undefined,
  onChange: ((t: T) => void) | undefined,
): [T | undefined, (v?: T) => void] {
  const [state, set] = useState(initial);

  const handleOnChange = useCallback(
    (v?: T) => {
      if (v) {
        set(v);
        onChange?.(v);
      }
    },
    [onChange],
  );

  useEffect(() => {
    set(initial);
  }, [initial]);

  return [state, handleOnChange];
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
