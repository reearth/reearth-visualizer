import {
  createContext,
  ReactNode,
  useCallback,
  useContext as useReactContext,
  useEffect,
  useMemo,
} from "react";

import events from "@reearth/util/event";
import { Rect } from "@reearth/util/value";

import { MouseEvents, MouseEventHandles } from "../Engine/ref";
import type { LayerStore } from "../Layers";
import type { Component as PrimitiveComponent } from "../Primitive";
import { useGet } from "../utils";

import type { CommonReearth } from "./api";
import { commonReearth } from "./api";
import type {
  CameraPosition,
  Layer,
  OverriddenInfobox,
  ReearthEventType,
  FlyToDestination,
  LookAtDestination,
  Tag,
  MouseEvent,
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
  tags?: Tag[];
  camera?: CameraPosition;
  layers: LayerStore;
  selectedLayer?: Layer;
  layerSelectionReason?: string;
  layerOverridenInfobox?: OverriddenInfobox;
  layerOverriddenProperties?: { [key: string]: any };
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
  layersInViewport: () => Layer[];
  viewport: () => Rect | undefined;
  onMouseEvent: (type: keyof MouseEventHandles, fn: any) => void;
};

export type Context = {
  reearth: CommonReearth;
  engine: EngineContext;
  overrideSceneProperty: (id: string, property: any) => void;
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
  tags,
  camera,
  layers,
  selectedLayer,
  layerSelectionReason,
  layerOverridenInfobox,
  layerOverriddenProperties,
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
  viewport,
  onMouseEvent,
  children,
}: Props): JSX.Element {
  const [ev, emit] = useMemo(
    () => events<Pick<ReearthEventType, "cameramove" | "select" | keyof MouseEvents>>(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [engineName],
  );

  const getLayers = useGet(layers);
  const getSceneProperty = useGet(sceneProperty);
  const getTags = useGet(tags ?? []);
  const getCamera = useGet(camera);
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
        tags: getTags,
        camera: getCamera,
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
        viewport,
      }),
      overrideSceneProperty,
    }),
    [
      api,
      builtinPrimitives,
      engineName,
      ev,
      getLayers,
      getSceneProperty,
      getTags,
      getCamera,
      getSelectedLayer,
      getLayerSelectionReason,
      getLayerOverriddenInfobox,
      getLayerOverriddenProperties,
      showLayer,
      hideLayer,
      selectLayer,
      addLayer,
      overrideLayerProperty,
      overrideSceneProperty,
      overrideScenePropertyCommon,
      layersInViewport,
      flyTo,
      lookAt,
      zoomIn,
      zoomOut,
      viewport,
    ],
  );

  useEmit<Pick<ReearthEventType, "cameramove" | "select" | keyof MouseEvents>>(
    {
      select: useMemo<[layerId: string | undefined]>(
        () => (selectedLayer ? [selectedLayer.id] : [undefined]),
        [selectedLayer],
      ),
      cameramove: useMemo<[camera: CameraPosition] | undefined>(
        () => (camera ? [camera] : undefined),
        [camera],
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
