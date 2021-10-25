import type { Options } from "quickjs-emscripten-sync";
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext as useReactContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

import events from "@reearth/util/event";

import type { LayerStore } from "../Layers";
import type { Component as PrimitiveComponent } from "../Primitive";

import type { CommonReearth } from "./api";
import { commonReearth } from "./api";
import type {
  CameraPosition,
  Layer,
  OverriddenInfobox,
  ReearthEventType,
  FlyToDestination,
  LookAtDestination,
} from "./types";

export type EngineContext = {
  api?: any;
  isMarshalable?: Options["isMarshalable"];
  builtinPrimitives?: Record<string, PrimitiveComponent>;
};

export type Props = {
  engine: EngineContext;
  engineName: string;
  sceneProperty?: any;
  camera?: CameraPosition;
  layers: LayerStore;
  selectedLayer?: Layer;
  layerSelectionReason?: string;
  layerOverridenInfobox?: OverriddenInfobox;
  layerOverriddenProperties?: { [key: string]: any };
  showLayer: (...id: string[]) => void;
  hideLayer: (...id: string[]) => void;
  selectLayer: (id?: string, options?: { reason?: string }) => void;
  overrideLayerProperty: (id: string, property: any) => void;
  flyTo: (dest: FlyToDestination) => void;
  lookAt: (dest: LookAtDestination) => void;
  zoomIn: (amount: number) => void;
  zoomOut: (amount: number) => void;
};

export type Context = {
  reearth: CommonReearth;
  engine: EngineContext;
};

export const context = createContext<Context | undefined>(undefined);
export const useContext = (): Context | undefined => useReactContext(context);

declare global {
  interface Window {
    reearth?: CommonReearth;
  }
}

export function Provider({
  engine: { api, isMarshalable, builtinPrimitives },
  engineName,
  sceneProperty,
  camera,
  layers,
  selectedLayer,
  layerSelectionReason,
  layerOverridenInfobox,
  layerOverriddenProperties,
  showLayer,
  hideLayer,
  selectLayer,
  overrideLayerProperty,
  flyTo,
  lookAt,
  zoomIn,
  zoomOut,
  children,
}: PropsWithChildren<Props>): JSX.Element {
  const [ev, emit] = useMemo(
    () => events<Pick<ReearthEventType, "cameramove" | "select">>(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [engineName],
  );

  const getLayers = useGet(layers);
  const getSceneProperty = useGet(sceneProperty);
  const getCamera = useGet(camera);
  const getSelectedLayer = useGet(selectedLayer);
  const getLayerSelectionReason = useGet(layerSelectionReason);
  const getLayerOverriddenInfobox = useGet(layerOverridenInfobox);
  const getLayerOverriddenProperties = useGet(layerOverriddenProperties);

  const value = useMemo<Context>(
    () => ({
      engine: {
        api,
        isMarshalable,
        builtinPrimitives,
      },
      reearth: commonReearth({
        engineName,
        events: ev,
        layers: getLayers,
        sceneProperty: getSceneProperty,
        camera: getCamera,
        selectedLayer: getSelectedLayer,
        layerSelectionReason: getLayerSelectionReason,
        layerOverriddenInfobox: getLayerOverriddenInfobox,
        layerOverriddenProperties: getLayerOverriddenProperties,
        showLayer,
        hideLayer,
        selectLayer,
        overrideLayerProperty,
        flyTo,
        lookAt,
        zoomIn,
        zoomOut,
      }),
    }),
    [
      api,
      isMarshalable,
      builtinPrimitives,
      engineName,
      ev,
      getLayers,
      getSceneProperty,
      getCamera,
      getSelectedLayer,
      getLayerSelectionReason,
      getLayerOverriddenInfobox,
      showLayer,
      hideLayer,
      selectLayer,
      overrideLayerProperty,
      flyTo,
      lookAt,
      zoomIn,
      zoomOut,
    ],
  );

  useEmit<Pick<ReearthEventType, "cameramove" | "select">>(
    {
      select: selectedLayer ? [selectedLayer.id] : undefined,
      cameramove: camera ? [camera] : undefined,
    },
    emit,
  );

  // expose plugin API for developers
  useEffect(() => {
    window.reearth = value.reearth;
    return () => {
      delete window.reearth;
    };
  }, [value.reearth]);

  return <context.Provider value={value}>{children}</context.Provider>;
}

export function useGet<T>(value: T): () => T {
  const ref = useRef<T>(value);
  ref.current = value;
  return useCallback(() => ref.current, []);
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
