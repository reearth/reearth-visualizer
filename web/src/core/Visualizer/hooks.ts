import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWindowSize } from "react-use";

import { convertTime, truncMinutes } from "@reearth/util/time";
import { type DropOptions, useDrop } from "@reearth/util/use-dnd";

import type { Block, BuiltinWidgets } from "../Crust";
import { getBuiltinWidgetOptions } from "../Crust/Widgets/Widget";
import type { ComputedFeature, Feature, LatLng, SelectedFeatureInfo } from "../mantle";
import type {
  Ref as MapRef,
  LayerSelectionReason,
  Camera,
  ComputedLayer,
  SceneProperty,
  LayerEditEvent,
  DefaultInfobox,
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
  ownBuiltinWidgets,
  onLayerSelect,
  onBlockSelect,
  onCameraChange,
  onZoomToLayer,
  onLayerDrop,
}: {
  selectedBlockId?: string;
  camera?: Camera;
  isEditable?: boolean;
  rootLayerId?: string;
  sceneProperty?: SceneProperty;
  zoomedLayerId?: string;
  ownBuiltinWidgets?: (keyof BuiltinWidgets)[];
  onLayerSelect?: (
    layerId: string | undefined,
    featureId: string | undefined,
    layer: (() => Promise<ComputedLayer | undefined>) | undefined,
    reason: LayerSelectionReason | undefined,
  ) => void;
  onBlockSelect?: (blockId?: string) => void;
  onCameraChange?: (camera: Camera) => void;
  onZoomToLayer?: (layerId: string | undefined) => void;
  onLayerDrop?: (layerId: string, propertyKey: string, position: LatLng | undefined) => void;
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
      info: SelectedFeatureInfo | undefined,
    ) => {
      const computedLayer = await layer?.();

      selectFeature(computedLayer?.originalFeatures.find(f => f.id === featureId));
      selectComputedFeature(computedLayer?.features.find(f => f.id === featureId) ?? info?.feature);

      selectLayer({ layerId, featureId, layer: computedLayer, reason });
    },
    [],
  );

  // blocks
  const blocks = useMemo(
    () =>
      selectedLayer.layer?.layer?.infobox?.blocks?.map(b => ({
        ...b,
        property: b.property?.default ?? b.property,
      })),
    [selectedLayer.layer?.layer?.infobox?.blocks],
  );

  // Infobox
  const defaultInfobox = selectedLayer.reason?.defaultInfobox;
  const infobox = useMemo(
    () =>
      selectedLayer
        ? {
            title: selectedLayer.layer?.layer?.title || defaultInfobox?.title,
            isEditable: !!selectedLayer.layer?.layer?.infobox,
            visible: !!selectedLayer.layer?.layer?.infobox || !!defaultInfobox,
            property: selectedLayer.layer?.layer?.infobox?.property?.default,
            blocks: blocks?.length ? blocks : defaultInfoboxBlocks(defaultInfobox),
          }
        : undefined,
    [selectedLayer, defaultInfobox, blocks],
  );
  const handleInfoboxClose = useCallback(() => {
    if (infobox?.property?.unselectOnClose) {
      mapRef?.current?.layers.select(undefined);
    }
  }, [infobox]);

  // scene
  const [overriddenSceneProperty, overrideSceneProperty] = useOverriddenProperty(sceneProperty);

  // clock
  const overriddenClock = useMemo(() => {
    const { start, stop, current } = overriddenSceneProperty.timeline || {};
    const startTime = convertTime(start)?.getTime();
    const stopTime = convertTime(stop)?.getTime();
    const currentTime = convertTime(current)?.getTime();

    const DEFAULT_NEXT_RANGE = 86400000; // a day

    // To avoid out of range error in Cesium, we need to turn back a hour.
    const now = Date.now() - 3600000;

    const convertedStartTime = startTime
      ? Math.min(now, startTime)
      : stopTime
      ? Math.min(now, stopTime - DEFAULT_NEXT_RANGE)
      : now - DEFAULT_NEXT_RANGE;

    const convertedStopTime = stopTime
      ? Math.min(stopTime, now)
      : startTime
      ? Math.min(now, startTime + DEFAULT_NEXT_RANGE)
      : now;

    return {
      start: start || stop ? truncMinutes(new Date(convertedStartTime)) : undefined,
      stop: start || stop ? new Date(convertedStopTime) : undefined,
      current:
        start || stop || current
          ? new Date(
              Math.max(
                Math.min(convertedStopTime, currentTime || convertedStartTime),
                convertedStartTime,
              ),
            )
          : undefined,
    };
  }, [overriddenSceneProperty]);

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

  // dnd
  const [isLayerDragging, setIsLayerDragging] = useState(false);
  const handleLayerDrag = useCallback(() => {
    setIsLayerDragging(true);
  }, []);
  const handleLayerDrop = useCallback(
    (layerId: string, _featureId: string | undefined, latlng: LatLng | undefined) => {
      setIsLayerDragging(false);
      const layer = mapRef.current?.layers.findById(layerId);
      const propertyKey = layer?.property.default.location
        ? "default.location"
        : layer?.property.default.position
        ? "default.position"
        : undefined;
      if (latlng && layer && layer.propertyId && propertyKey) {
        onLayerDrop?.(layer.propertyId, propertyKey, latlng);
      }
    },
    [onLayerDrop, mapRef],
  );

  // shouldRender
  const shouldRender = useMemo(() => {
    const shouldWidgetAnimate = ownBuiltinWidgets?.some(
      id => !!getBuiltinWidgetOptions(id).animation,
    );
    return shouldWidgetAnimate;
  }, [ownBuiltinWidgets]);

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
    overriddenClock,
    isDroppable,
    infobox,
    isLayerDragging,
    shouldRender,
    handleLayerSelect,
    handleBlockSelect: selectBlock,
    handleCameraChange: changeCamera,
    handleLayerDrag,
    handleLayerDrop,
    overrideSceneProperty,
    handleLayerEdit,
    onLayerEdit,
    handleInfoboxClose,
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

function defaultInfoboxBlocks(defaultInfobox: DefaultInfobox | undefined): Block[] | undefined {
  if (defaultInfobox?.content.type === "table") {
    return Array.isArray(defaultInfobox?.content.value)
      ? [
          {
            id: "content",
            pluginId: "reearth",
            extensionId: "dlblock",
            property: {
              items: defaultInfobox.content.value.map((c, i) => ({
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

  if (defaultInfobox?.content.type === "html") {
    return defaultInfobox.content.value
      ? [
          {
            id: "content",
            pluginId: "reearth",
            extensionId: "htmlblock",
            property: {
              html: defaultInfobox.content.value,
            },
          },
        ]
      : undefined;
  }

  return undefined;
}
