import { useCallback, useEffect, useMemo } from "react";

import type { CameraPosition } from "@reearth/core/mantle";
import { type MouseEventHandles, type MouseEvents, events, useGet } from "@reearth/core/Map";

import { commonReearth } from "./api";
import { ReearthEventType, Viewport, ViewportSize } from "./plugin_types";
import { Context, Props } from "./types";
import useClientStorage from "./useClientStorage";
import usePluginInstances from "./usePluginInstances";

export type SelectedReearthEventType = Pick<
  ReearthEventType,
  "cameramove" | "select" | "tick" | "resize" | keyof MouseEvents | "layeredit"
>;

export default function ({
  engineName,
  mapRef,
  sceneProperty,
  inEditor,
  tags,
  viewport,
  selectedLayer,
  layerSelectionReason,
  alignSystem,
  floatingWidgets,
  overrideSceneProperty,
}: Props) {
  const [ev, emit] = useMemo(() => events<SelectedReearthEventType>(), []);

  const layersRef = mapRef?.current?.layers;
  const engineRef = mapRef?.current?.engine;

  const camera = useMemo(() => engineRef?.getCamera(), [engineRef]);
  const clock = useMemo(() => engineRef?.getClock(), [engineRef]);

  const pluginInstances = usePluginInstances({
    alignSystem,
    floatingWidgets,
    blocks: selectedLayer?.layer?.infobox?.blocks,
  });
  const clientStorage = useClientStorage();

  const getLayers = useGet(layersRef);
  const getSceneProperty = useGet(sceneProperty);
  const getInEditor = useGet(!!inEditor);
  const getTags = useGet(tags ?? []);
  const getCamera = useGet(camera);
  const getClock = useGet({
    startTime: clock?.start,
    stopTime: clock?.stop,
    currentTime: clock?.current,
    playing: clock?.playing,
    paused: !clock?.playing,
    speed: clock?.speed,
    play: engineRef?.play,
    pause: engineRef?.pause,
    tick: engineRef?.tick,
  });
  const getPluginInstances = useGet(pluginInstances);
  const getViewport = useGet(viewport as Viewport);
  const getSelectedLayer = useGet(selectedLayer);
  const getLayerSelectionReason = useGet(layerSelectionReason);
  const overrideScenePropertyCommon = useCallback(
    (property: any) => {
      return overrideSceneProperty("", property);
    },
    [overrideSceneProperty],
  );

  const layersInViewport = useCallback(() => {
    return layersRef?.findAll(layer => !!engineRef?.inViewport(layer?.property?.default?.location));
  }, [engineRef, layersRef]);

  const value = useMemo<Context>(
    () => ({
      reearth: commonReearth({
        engineName,
        events: ev,
        layers: getLayers,
        sceneProperty: getSceneProperty,
        inEditor: getInEditor,
        tags: getTags,
        camera: getCamera,
        clock: getClock,
        pluginInstances: getPluginInstances,
        viewport: getViewport,
        selectedLayer: getSelectedLayer,
        layerSelectionReason: getLayerSelectionReason,
        layerOverriddenProperties: layersRef?.overriddenLayers,
        showLayer: layersRef?.show,
        hideLayer: layersRef?.hide,
        addLayer: layersRef?.add,
        selectLayer: layersRef?.select,
        overrideLayerProperty: layersRef?.override,
        overrideSceneProperty: overrideScenePropertyCommon,
        layersInViewport,
        flyTo: engineRef?.flyTo,
        lookAt: engineRef?.lookAt,
        zoomIn: engineRef?.zoomIn,
        zoomOut: engineRef?.zoomOut,
        cameraViewport: engineRef?.getViewport,
        rotateRight: engineRef?.rotateRight,
        orbit: engineRef?.orbit,
        captureScreen: engineRef?.captureScreen,
        getLocationFromScreen: engineRef?.getLocationFromScreen,
        enableScreenSpaceCameraController: engineRef?.enableScreenSpaceCameraController,
        lookHorizontal: engineRef?.lookHorizontal,
        lookVertical: engineRef?.lookVertical,
        moveForward: engineRef?.moveForward,
        moveBackward: engineRef?.moveBackward,
        moveUp: engineRef?.moveUp,
        moveDown: engineRef?.moveDown,
        moveLeft: engineRef?.moveLeft,
        moveRight: engineRef?.moveRight,
        moveOverTerrain: engineRef?.moveOverTerrain,
        flyToGround: engineRef?.flyToGround,
      }),
      overrideSceneProperty,
      pluginInstances,
      clientStorage,
    }),
    [
      engineName,
      ev,
      getLayers,
      getSceneProperty,
      getInEditor,
      getTags,
      getCamera,
      getClock,
      getPluginInstances,
      getViewport,
      getSelectedLayer,
      getLayerSelectionReason,
      overrideScenePropertyCommon,
      layersRef,
      engineRef,
      layersInViewport,
      pluginInstances,
      clientStorage,
      overrideSceneProperty,
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
        return clock ? [clock.current] : undefined;
      }, [clock]),
      resize: useMemo<[viewport: ViewportSize] | undefined>(
        () => [
          {
            width: viewport?.width,
            height: viewport?.height,
            isMobile: viewport?.isMobile,
          } as ViewportSize,
        ],
        [viewport?.width, viewport?.height, viewport?.isMobile],
      ),
    },
    emit,
  );

  const onMouseEvent = useCallback(
    (eventType: keyof MouseEventHandles, fn: any) => {
      mapRef?.current?.engine[eventType]?.(fn);
    },
    [mapRef],
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
  }, [value]);

  return value;
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
