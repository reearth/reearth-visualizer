import { Rectangle, Cartographic, Math as CesiumMath } from "cesium";
import { useRef, useEffect, useMemo, useState, useCallback, RefObject, useReducer } from "react";
import { initialize, pageview } from "react-ga";
import { useSet } from "react-use";

import { useDrop, DropOptions } from "@reearth/util/use-dnd";
import { Camera, LatLng, ValueTypes, ValueType } from "@reearth/util/value";

import type {
  OverriddenInfobox,
  Ref as EngineRef,
  SceneProperty,
  SelectLayerOptions,
} from "./Engine";
import type { MouseEventHandles } from "./Engine/ref";
import type { Props as InfoboxProps, Block } from "./Infobox";
import { LayerStore, Layer } from "./Layers";
import type { ProviderProps } from "./Plugin";
import type { PluginModalInfo } from "./Plugin/ModalContainer";
import type { PluginPopupInfo } from "./Plugin/PopupContainer";
import type {
  CameraOptions,
  Clock,
  FlyToDestination,
  LookAtDestination,
  Tag,
} from "./Plugin/types";
import useClientStorage from "./useClientStorage";
import usePluginInstances from "./usePluginInstances";
import useViewport from "./useViewport";
import useWidgetAlignSystem from "./useWidgetAlignSystem";
import { useOverriddenProperty } from "./utils";
import type { WidgetAlignSystem, Widget } from "./WidgetAlignSystem";

export type { Viewport } from "./useViewport";

export default ({
  engineType,
  rootLayerId,
  isEditable,
  isBuilt,
  isPublished,
  inEditor,
  rootLayer,
  selectedLayerId: outerSelectedLayerId,
  selectedBlockId: outerSelectedBlockId,
  zoomedLayerId,
  camera,
  clock,
  sceneProperty,
  tags,
  alignSystem,
  floatingWidgets,
  onLayerSelect,
  onBlockSelect,
  onBlockChange,
  onCameraChange,
  onTick,
  onLayerDrop,
  onZoomToLayer,
}: {
  engineType?: string;
  rootLayerId?: string;
  isEditable?: boolean;
  isBuilt?: boolean;
  isPublished?: boolean;
  inEditor?: boolean;
  rootLayer?: Layer;
  selectedLayerId?: string;
  selectedBlockId?: string;
  zoomedLayerId?: string;
  camera?: Camera;
  clock?: Clock;
  sceneProperty?: SceneProperty;
  tags?: Tag[];
  alignSystem?: WidgetAlignSystem;
  floatingWidgets?: Widget[];
  onLayerSelect?: (id?: string) => void;
  onBlockSelect?: (id?: string) => void;
  onBlockChange?: <T extends keyof ValueTypes>(
    blockId: string,
    schemaGroupId: string,
    fid: string,
    v: ValueTypes[T],
    vt: T,
    selectedLayer?: Layer,
  ) => void;
  onCameraChange?: (c: Camera) => void;
  onTick?: (c: Clock) => void;
  onLayerDrop?: (layer: Layer, key: string, latlng: LatLng) => void;
  onZoomToLayer?: (layerId: string | undefined) => void;
}) => {
  const engineRef = useRef<EngineRef>(null);
  const [overriddenSceneProperty, overrideSceneProperty] = useOverriddenProperty(sceneProperty);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const { ref: dropRef, isDroppable } = useDrop(
    useMemo(
      (): DropOptions => ({
        accept: ["primitive"],
        drop(_item, context) {
          if (!rootLayerId || !isEditable) return;
          const loc = context.position
            ? engineRef.current?.getLocationFromScreen(context.position.x, context.position.y)
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

  const {
    selectedLayer,
    selectedLayerId,
    layerOverriddenProperties,
    layerSelectionReason,
    layerOverridenInfobox,
    infobox,
    layers,
    selectLayer,
    hideLayers,
    isLayerHidden,
    showLayers,
    addLayer,
    overrideLayerProperty,
  } = useLayers({
    rootLayer,
    selected: outerSelectedLayerId,
    onSelect: onLayerSelect,
  });

  // selected block
  const [selectedBlockId, selectBlock] = useInnerState<string>(outerSelectedBlockId, onBlockSelect);

  useEffect(() => {
    if (!isEditable || !isBuilt) {
      selectBlock();
    }
  }, [isEditable, isBuilt, selectBlock]);

  const changeBlock = useCallback(
    <T extends ValueType>(
      blockId: string,
      schemaItemId: string,
      fieldId: string,
      value: ValueTypes[T],
      type: T,
    ) => {
      onBlockChange?.(blockId, schemaItemId, fieldId, value, type, selectedLayer);
    },
    [onBlockChange, selectedLayer],
  );

  // camera
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

  // clock
  const [innerClock, setInnerClock] = useState(clock);
  useEffect(() => {
    setInnerClock(clock);
  }, [clock]);

  const updateClock = useCallback(
    (clock: Clock) => {
      setInnerClock(clock);
      onTick?.(clock);
    },
    [onTick],
  );

  // dnd
  const [isLayerDragging, setIsLayerDragging] = useState(false);
  const handleLayerDrag = useCallback(() => {
    setIsLayerDragging(true);
  }, []);
  const handleLayerDrop = useCallback(
    (id: string, key: string, latlng: LatLng | undefined) => {
      setIsLayerDragging(false);
      const layer = layers.findById(id);
      if (latlng && layer) onLayerDrop?.(layer, key, latlng);
    },
    [onLayerDrop, layers],
  );

  // GA
  const { enableGA, trackingId } = sceneProperty?.googleAnalytics || {};

  useEffect(() => {
    if (!isPublished || !enableGA || !trackingId) return;
    initialize(trackingId);
    pageview(window.location.pathname);
  }, [isPublished, enableGA, trackingId]);

  const { overriddenAlignSystem, moveWidget } = useWidgetAlignSystem({
    alignSystem,
  });

  const pluginInstances = usePluginInstances({
    alignSystem,
    floatingWidgets,
    blocks: selectedLayer?.infobox?.blocks,
  });

  const clientStorage = useClientStorage();

  const providerProps: ProviderProps = useProviderProps(
    {
      engineName: engineType || "",
      sceneProperty: overriddenSceneProperty,
      inEditor: !!inEditor,
      built: !!isBuilt,
      tags,
      camera: innerCamera,
      clock: innerClock,
      pluginInstances,
      selectedLayer,
      layerSelectionReason,
      layerOverridenInfobox,
      layerOverriddenProperties,
      viewport,
      clientStorage,
      showLayer: showLayers,
      hideLayer: hideLayers,
      addLayer,
      selectLayer,
      overrideLayerProperty,
      overrideSceneProperty,
      moveWidget,
    },
    engineRef,
    layers,
  );

  useEffect(() => {
    engineRef.current?.requestRender();
  });

  const handleInfoboxMaskClick = useCallback(() => {
    selectLayer(undefined);
  }, [selectLayer]);

  useEffect(() => {
    if (zoomedLayerId) {
      engineRef.current?.lookAtLayer(zoomedLayerId);
      onZoomToLayer?.(undefined);
    }
  }, [zoomedLayerId, onZoomToLayer]);

  const [shownPluginModalInfo, onPluginModalShow] = useState<PluginModalInfo>();
  const pluginModalContainerRef = useRef<HTMLDivElement>();

  const [shownPluginPopupInfo, onPluginPopupShow] = useState<PluginPopupInfo>();
  const pluginPopupContainerRef = useRef<HTMLDivElement>();

  return {
    engineRef,
    wrapperRef,
    isDroppable,
    providerProps,
    selectedLayerId,
    selectedLayer,
    layers,
    layerSelectionReason,
    layerOverriddenProperties,
    isLayerDragging,
    selectedBlockId,
    innerCamera,
    innerClock,
    infobox,
    overriddenSceneProperty,
    pluginModalContainerRef,
    shownPluginModalInfo,
    pluginPopupContainerRef,
    shownPluginPopupInfo,
    viewport,
    overriddenAlignSystem,
    onPluginModalShow,
    onPluginPopupShow,
    isLayerHidden,
    selectLayer,
    selectBlock,
    changeBlock,
    updateCamera,
    updateClock,
    handleLayerDrag,
    handleLayerDrop,
    handleInfoboxMaskClick,
  };
};

function useLayers({
  rootLayer,
  selected: outerSelectedPrimitiveId,
  onSelect,
}: {
  rootLayer?: Layer;
  selected?: string;
  onSelect?: (id?: string, options?: SelectLayerOptions) => void;
}) {
  const [selectedLayerId, innerSelectLayer] = useState<string | undefined>();
  const [layerSelectionReason, setSelectionReason] = useState<string | undefined>();
  const [layerOverridenInfobox, setPrimitiveOverridenInfobox] = useState<OverriddenInfobox>();
  const [layers] = useState<LayerStore>(() => new LayerStore(rootLayer));
  const updateReducer = useCallback((num: number): number => (num + 1) % 1_000_000, []);
  const [layersRenderKey, forceUpdate] = useReducer(updateReducer, 0);

  useEffect(() => {
    layers.setRootLayer(rootLayer);
    forceUpdate();
  }, [layers, rootLayer]);

  const selectedLayer = useMemo(
    () => (selectedLayerId ? layers?.findById(selectedLayerId) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedLayerId, layers, layersRenderKey],
  );

  const selectLayer = useCallback(
    (id?: string, { reason, overriddenInfobox }: SelectLayerOptions = {}) => {
      innerSelectLayer(id);
      onSelect?.(id && !!layers.findById(id) ? id : undefined);
      setSelectionReason(reason);
      setPrimitiveOverridenInfobox(overriddenInfobox);
    },
    [onSelect, layers],
  );

  const addLayer = useCallback(
    (layer: Layer, parentId?: string, creator?: string) => {
      const id = layers.add(layer, parentId, creator);
      forceUpdate();
      return id;
    },
    [layers],
  );

  const blocks = useMemo(
    (): Block[] | undefined => overridenInfoboxBlocks(layerOverridenInfobox),
    [layerOverridenInfobox],
  );

  const infobox = useMemo<
    | Pick<InfoboxProps, "infoboxKey" | "title" | "visible" | "layer" | "blocks" | "isEditable">
    | undefined
  >(
    () =>
      selectedLayer || layerOverridenInfobox
        ? {
            infoboxKey: selectedLayer?.id,
            title: layerOverridenInfobox?.title || selectedLayer?.title,
            isEditable: !layerOverridenInfobox && !!selectedLayer?.infobox,
            visible: !!selectedLayer?.infobox || !!layerOverridenInfobox,
            layer: selectedLayer,
            blocks,
          }
        : undefined,
    [selectedLayer, layerOverridenInfobox, blocks],
  );

  const [, { add: hideLayer, remove: showLayer, has: isLayerHidden }] = useSet<string>();
  const showLayers = useCallback(
    (...ids: string[]) => {
      for (const id of ids) {
        showLayer(id);
      }
    },
    [showLayer],
  );
  const hideLayers = useCallback(
    (...ids: string[]) => {
      for (const id of ids) {
        hideLayer(id);
      }
    },
    [hideLayer],
  );

  useEffect(() => {
    innerSelectLayer(outerSelectedPrimitiveId);
    setSelectionReason(undefined);
    setPrimitiveOverridenInfobox(undefined);
  }, [outerSelectedPrimitiveId]);

  const [layerOverriddenProperties, setLayeroverriddenProperties] = useState<{
    [id in string]: any;
  }>({});
  const overrideLayerProperty = useCallback((id: string, property: any) => {
    if (!id) return;
    if (typeof property !== "object") {
      setLayeroverriddenProperties(p => {
        delete p[id];
        return { ...p };
      });
      return;
    }
    setLayeroverriddenProperties(p => ({
      ...p,
      [id]: property,
    }));
  }, []);

  return {
    layers,
    selectedLayer,
    selectedLayerId,
    layerSelectionReason,
    layerOverridenInfobox,
    layerOverriddenProperties,
    infobox,
    isLayerHidden,
    selectLayer,
    showLayers,
    hideLayers,
    addLayer,
    overrideLayerProperty,
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

function overridenInfoboxBlocks(
  overriddenInfobox: OverriddenInfobox | undefined,
): Block[] | undefined {
  if (overriddenInfobox?.content.type === "table") {
    return Array.isArray(overriddenInfobox?.content)
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

  if (overriddenInfobox?.content.type === "html") {
    return overriddenInfobox.content.value
      ? [
          {
            id: "content",
            pluginId: "reearth",
            extensionId: "htmlblock",
            property: {
              default: {
                html: overriddenInfobox.content.value,
              },
            },
          },
        ]
      : undefined;
  }

  return undefined;
}

function useProviderProps(
  props: Omit<
    ProviderProps,
    | "engine"
    | "flyTo"
    | "lookAt"
    | "zoomIn"
    | "zoomOut"
    | "orbit"
    | "rotateRight"
    | "layers"
    | "layersInViewport"
    | "cameraViewport"
    | "onMouseEvent"
    | "captureScreen"
    | "getLocationFromScreen"
    | "enableScreenSpaceCameraController"
    | "lookHorizontal"
    | "lookVertical"
    | "moveForward"
    | "moveBackward"
    | "moveUp"
    | "moveDown"
    | "moveLeft"
    | "moveRight"
    | "moveOverTerrain"
    | "flyToGround"
  >,
  engineRef: RefObject<EngineRef>,
  layers: LayerStore,
): ProviderProps {
  const isMarshalable = useCallback(
    (obj: any): boolean | "json" => {
      const im = engineRef.current?.isMarshalable ?? false;
      return typeof im === "function" ? im(obj) : im;
    },
    [engineRef],
  );

  const engine = useMemo(
    () => ({
      get api() {
        return engineRef.current?.pluginApi;
      },
      isMarshalable,
      get builtinPrimitives() {
        return engineRef.current?.builtinPrimitives;
      },
    }),
    [engineRef, isMarshalable],
  );

  const flyTo = useCallback(
    (dest: FlyToDestination, options?: CameraOptions) => {
      engineRef.current?.flyTo(dest, options);
    },
    [engineRef],
  );

  const lookAt = useCallback(
    (dest: LookAtDestination, options?: CameraOptions) => {
      engineRef.current?.lookAt(dest, options);
    },
    [engineRef],
  );

  const cameraViewport = useCallback(() => {
    return engineRef.current?.getViewport();
  }, [engineRef]);

  const layersInViewport = useCallback(() => {
    const rect = engineRef.current?.getViewport();
    return layers.findAll(
      layer =>
        rect &&
        layer.property?.default?.location &&
        typeof layer.property.default.location.lng === "number" &&
        typeof layer.property.default.location.lat === "number" &&
        Rectangle.contains(
          new Rectangle(
            CesiumMath.toRadians(rect.west),
            CesiumMath.toRadians(rect.south),
            CesiumMath.toRadians(rect.east),
            CesiumMath.toRadians(rect.north),
          ),
          Cartographic.fromDegrees(
            layer.property.default.location.lng,
            layer.property.default.location.lat,
          ),
        ),
    );
  }, [engineRef, layers]);

  const zoomIn = useCallback(
    (amount: number) => {
      engineRef.current?.zoomIn(amount);
    },
    [engineRef],
  );

  const zoomOut = useCallback(
    (amount: number) => {
      engineRef.current?.zoomOut(amount);
    },
    [engineRef],
  );

  const rotateRight = useCallback(
    (radian: number) => {
      engineRef.current?.rotateRight(radian);
    },
    [engineRef],
  );

  const orbit = useCallback(
    (radian: number) => {
      engineRef.current?.orbit(radian);
    },
    [engineRef],
  );

  const onMouseEvent = useCallback(
    (eventType: keyof MouseEventHandles, fn: any) => {
      engineRef.current?.[eventType]?.(fn);
    },
    [engineRef],
  );

  const captureScreen = useCallback(
    (type?: string, encoderOptions?: number) => {
      return engineRef.current?.captureScreen(type, encoderOptions);
    },
    [engineRef],
  );

  const getLocationFromScreen = useCallback(
    (x: number, y: number, withTerrain?: boolean) => {
      return engineRef.current?.getLocationFromScreen(x, y, withTerrain);
    },
    [engineRef],
  );

  const enableScreenSpaceCameraController = useCallback(
    (enabled: boolean) => engineRef?.current?.enableScreenSpaceCameraController(enabled),
    [engineRef],
  );

  const lookHorizontal = useCallback(
    (amount: number) => {
      engineRef.current?.lookHorizontal(amount);
    },
    [engineRef],
  );

  const lookVertical = useCallback(
    (amount: number) => {
      engineRef.current?.lookVertical(amount);
    },
    [engineRef],
  );

  const moveForward = useCallback(
    (amount: number) => {
      engineRef.current?.moveForward(amount);
    },
    [engineRef],
  );

  const moveBackward = useCallback(
    (amount: number) => {
      engineRef.current?.moveBackward(amount);
    },
    [engineRef],
  );

  const moveUp = useCallback(
    (amount: number) => {
      engineRef.current?.moveUp(amount);
    },
    [engineRef],
  );

  const moveDown = useCallback(
    (amount: number) => {
      engineRef.current?.moveDown(amount);
    },
    [engineRef],
  );

  const moveLeft = useCallback(
    (amount: number) => {
      engineRef.current?.moveLeft(amount);
    },
    [engineRef],
  );

  const moveRight = useCallback(
    (amount: number) => {
      engineRef.current?.moveRight(amount);
    },
    [engineRef],
  );

  const moveOverTerrain = useCallback(
    (offset?: number) => {
      return engineRef.current?.moveOverTerrain(offset);
    },
    [engineRef],
  );

  const flyToGround = useCallback(
    (dest: FlyToDestination, options?: CameraOptions, offset?: number) => {
      engineRef.current?.flyToGround(dest, options, offset);
    },
    [engineRef],
  );

  return {
    ...props,
    engine,
    flyTo,
    lookAt,
    zoomIn,
    zoomOut,
    orbit,
    rotateRight,
    layers,
    layersInViewport,
    cameraViewport,
    onMouseEvent,
    captureScreen,
    getLocationFromScreen,
    enableScreenSpaceCameraController,
    lookHorizontal,
    lookVertical,
    moveForward,
    moveBackward,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    moveOverTerrain,
    flyToGround,
  };
}
