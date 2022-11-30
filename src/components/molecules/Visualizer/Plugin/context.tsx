import {
  createContext,
  ReactNode,
  useCallback,
  useContext as useReactContext,
  useEffect,
  useMemo,
} from "react";

import events, { EventEmitter } from "@reearth/util/event";
import { Rect } from "@reearth/util/value";

import { MouseEvents, MouseEventHandles } from "../Engine/ref";
import { Viewport as VisualizerViewport } from "../hooks";
import type { LayerStore } from "../Layers";
import type { Component as PrimitiveComponent } from "../Primitive";
import { useGet } from "../utils";

import type { CommonReearth } from "./api";
import { commonReearth } from "./api";
import type {
  CameraPosition,
  CameraOptions,
  Layer,
  OverriddenInfobox,
  ReearthEventType,
  FlyToDestination,
  LookAtDestination,
  Tag,
  MouseEvent,
  Clock,
  Viewport,
  LatLngHeight,
  WidgetLocationOptions,
} from "./types";

export type EngineContext = {
  api?: any;
  builtinPrimitives?: Record<string, PrimitiveComponent>;
};

export type Props = {
  children?: ReactNode;
  engine: EngineContext;
  engineName: string;
  sceneProperty?: any;
  inEditor: boolean;
  tags?: Tag[];
  camera?: CameraPosition;
  clock: Clock | undefined;
  layers: LayerStore;
  selectedLayer?: Layer;
  layerSelectionReason?: string;
  layerOverridenInfobox?: OverriddenInfobox;
  layerOverriddenProperties?: { [key: string]: any };
  viewport?: VisualizerViewport;
  showLayer: (...id: string[]) => void;
  hideLayer: (...id: string[]) => void;
  addLayer: (layer: Layer, parentId?: string, creator?: string) => string | undefined;
  selectLayer: (id?: string, options?: { reason?: string }) => void;
  overrideLayerProperty: (id: string, property: any) => void;
  overrideSceneProperty: (id: string, property: any) => void;
  flyTo: (dest: FlyToDestination) => void;
  lookAt: (dest: LookAtDestination) => void;
  zoomIn: (amount: number) => void;
  zoomOut: (amount: number) => void;
  rotateRight: (radian: number) => void;
  orbit: (radian: number) => void;
  layersInViewport: () => Layer[];
  cameraViewport: () => Rect | undefined;
  onMouseEvent: (type: keyof MouseEventHandles, fn: any) => void;
  captureScreen: (type?: string, encoderOptions?: number) => string | undefined;
  getLocationFromScreen: (x: number, y: number, withTerrain?: boolean) => LatLngHeight | undefined;
  enableScreenSpaceCameraController: (enabled: boolean) => void;
  lookHorizontal: (amount: number) => void;
  lookVertical: (amount: number) => void;
  moveForward: (amount: number) => void;
  moveBackward: (amount: number) => void;
  moveUp: (amount: number) => void;
  moveDown: (amount: number) => void;
  moveLeft: (amount: number) => void;
  moveRight: (amount: number) => void;
  moveOverTerrain: () => void;
  flyToGround: (destination: FlyToDestination, options?: CameraOptions, offset?: number) => void;
  moveWidget: (widgetId: string, options: WidgetLocationOptions) => void;
};

type SelectedReearthEventType = Pick<
  ReearthEventType,
  "cameramove" | "select" | "tick" | "resize" | keyof MouseEvents | "layeredit"
>;

export type Context = {
  reearth: CommonReearth;
  engine: EngineContext;
  overrideSceneProperty: (id: string, property: any) => void;
  emit: EventEmitter<SelectedReearthEventType>;
  moveWidget: (widgetId: string, options: WidgetLocationOptions) => void;
};

export const context = createContext<Context | undefined>(undefined);
export const useContext = (): Context | undefined => useReactContext(context);

declare global {
  interface Window {
    reearth?: CommonReearth;
  }
}

export function Provider({
  engine: { api, builtinPrimitives },
  engineName,
  sceneProperty,
  inEditor,
  tags,
  camera,
  clock,
  layers,
  selectedLayer,
  layerSelectionReason,
  layerOverridenInfobox,
  layerOverriddenProperties,
  viewport,
  showLayer,
  hideLayer,
  addLayer,
  selectLayer,
  overrideLayerProperty,
  overrideSceneProperty,
  layersInViewport,
  flyTo,
  lookAt,
  zoomIn,
  zoomOut,
  rotateRight,
  orbit,
  cameraViewport,
  captureScreen,
  getLocationFromScreen,
  onMouseEvent,
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
  moveWidget,
  children,
}: Props): JSX.Element {
  const [ev, emit] = useMemo(
    () => events<SelectedReearthEventType>(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [engineName],
  );

  const getLayers = useGet(layers);
  const getSceneProperty = useGet(sceneProperty);
  const getInEditor = useGet(inEditor);
  const getTags = useGet(tags ?? []);
  const getCamera = useGet(camera);
  const getClock = useGet(clock);
  const getViewport = useGet(viewport as Viewport);
  const getSelectedLayer = useGet(selectedLayer);
  const getLayerSelectionReason = useGet(layerSelectionReason);
  const getLayerOverriddenInfobox = useGet(layerOverridenInfobox);
  const getLayerOverriddenProperties = useGet(layerOverriddenProperties);
  const overrideScenePropertyCommon = useCallback(
    (property: any) => {
      return overrideSceneProperty("", property);
    },
    [overrideSceneProperty],
  );

  const value = useMemo<Context>(
    () => ({
      engine: {
        api,
        builtinPrimitives,
      },
      reearth: commonReearth({
        engineName,
        events: ev,
        layers: getLayers,
        sceneProperty: getSceneProperty,
        inEditor: getInEditor,
        tags: getTags,
        camera: getCamera,
        clock: getClock,
        viewport: getViewport,
        selectedLayer: getSelectedLayer,
        layerSelectionReason: getLayerSelectionReason,
        layerOverriddenInfobox: getLayerOverriddenInfobox,
        layerOverriddenProperties: getLayerOverriddenProperties,
        showLayer,
        hideLayer,
        addLayer,
        selectLayer,
        overrideLayerProperty,
        overrideSceneProperty: overrideScenePropertyCommon,
        layersInViewport,
        flyTo,
        lookAt,
        zoomIn,
        zoomOut,
        cameraViewport,
        rotateRight,
        orbit,
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
      }),
      overrideSceneProperty,
      emit,
      moveWidget,
    }),
    [
      api,
      builtinPrimitives,
      engineName,
      ev,
      getLayers,
      getSceneProperty,
      getInEditor,
      getTags,
      getCamera,
      getClock,
      getViewport,
      getSelectedLayer,
      getLayerSelectionReason,
      getLayerOverriddenInfobox,
      getLayerOverriddenProperties,
      showLayer,
      hideLayer,
      addLayer,
      selectLayer,
      overrideLayerProperty,
      overrideScenePropertyCommon,
      layersInViewport,
      flyTo,
      lookAt,
      zoomIn,
      zoomOut,
      cameraViewport,
      rotateRight,
      orbit,
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
      overrideSceneProperty,
      emit,
      moveWidget,
    ],
  );

  useEmit<SelectedReearthEventType>(
    {
      select: useMemo<[layerId: string | undefined]>(
        () => (selectedLayer ? [selectedLayer.id] : [undefined]),
        [selectedLayer],
      ),
      cameramove: useMemo<[camera: CameraPosition] | undefined>(
        () => (camera ? [camera] : undefined),
        [camera],
      ),
      tick: useMemo<[date: Date] | undefined>(() => {
        return clock ? [clock.currentTime] : undefined;
      }, [clock]),
      resize: useMemo<[viewport: Viewport] | undefined>(
        () => (viewport ? [viewport] : undefined),
        [viewport],
      ),
    },
    emit,
  );

  useEffect(() => {
    const eventHandles: {
      [index in keyof MouseEvents]: keyof MouseEventHandles;
    } = {
      click: "onClick",
      doubleclick: "onDoubleClick",
      mousedown: "onMouseDown",
      mouseup: "onMouseUp",
      rightclick: "onRightClick",
      rightdown: "onRightDown",
      rightup: "onRightUp",
      middleclick: "onMiddleClick",
      middledown: "onMiddleDown",
      middleup: "onMiddleUp",
      mousemove: "onMouseMove",
      mouseenter: "onMouseEnter",
      mouseleave: "onMouseLeave",
      wheel: "onWheel",
    };
    (Object.keys(eventHandles) as (keyof MouseEvents)[]).forEach((event: keyof MouseEvents) => {
      onMouseEvent(eventHandles[event], (props: MouseEvent) => {
        emit(event, props);
      });
    });
  }, [emit, onMouseEvent]);

  // expose plugin API for developers
  useEffect(() => {
    window.reearth = value.reearth;
    return () => {
      delete window.reearth;
    };
  }, [value.reearth]);

  return <context.Provider value={value}>{children}</context.Provider>;
}

export function useEmit<T extends { [K in string]: any[] }>(
  values: { [K in keyof T]?: T[K] | undefined },
  emit: (<K extends keyof T>(key: K, ...args: T[K]) => void) | undefined,
) {
  for (const k of Object.keys(values)) {
    const args = values[k];
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (!args) return;
      emit?.(k, ...args);
    }, [emit, k, args]);
  }
}
