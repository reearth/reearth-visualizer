import { MouseEventHandles, MouseEvents } from "@reearth/core";
import { useCallback, useEffect, useMemo } from "react";

import { useGet } from "../../utils";
import {
  InteractionMode,
  SelectionModeEventType,
  ViewerEventType,
  Viewport,
  ViewportSize
} from "../pluginAPI/types";
import { Props } from "../types";
import { events, useEmit } from "../utils/events";

export default ({
  viewerProperty,
  overrideViewerProperty,
  viewport,
  mapRef,
  interactionMode,
  overrideInteractionMode,
  inEditor,
  built,
  onLayerSelectWithRectStart,
  onLayerSelectWithRectMove,
  onLayerSelectWithRectEnd
}: Pick<
  Props,
  | "viewerProperty"
  | "overrideViewerProperty"
  | "viewport"
  | "mapRef"
  | "interactionMode"
  | "overrideInteractionMode"
  | "inEditor"
  | "built"
  | "onLayerSelectWithRectStart"
  | "onLayerSelectWithRectMove"
  | "onLayerSelectWithRectEnd"
>) => {
  const engineRef = mapRef?.current?.engine;
  const geoidRef = mapRef?.current?.geoid;

  const getViewerProperty = useGet(viewerProperty);

  const overrideViewerPropertyCommon = useCallback(
    (property: any) => {
      return overrideViewerProperty?.("", property);
    },
    [overrideViewerProperty]
  );

  const getViewport = useGet(viewport as Viewport);

  const captureScreen = useCallback(
    (type?: string, encoderOptions?: number) => {
      return engineRef?.captureScreen(type, encoderOptions);
    },
    [engineRef]
  );

  // selection mode events
  const [selectionModeEvents, emitSelectionModeEvent] = useMemo(
    () => events<SelectionModeEventType>(),
    []
  );

  useEffect(() => {
    onLayerSelectWithRectStart?.((e) => {
      emitSelectionModeEvent("marqueeStart", e);
    });
  }, [emitSelectionModeEvent, onLayerSelectWithRectStart]);

  useEffect(() => {
    onLayerSelectWithRectMove?.((e) => {
      emitSelectionModeEvent("marqueeMove", e);
    });
  }, [emitSelectionModeEvent, onLayerSelectWithRectMove]);

  useEffect(() => {
    onLayerSelectWithRectEnd?.((e) => {
      emitSelectionModeEvent("marqueeEnd", e);
    });
  }, [emitSelectionModeEvent, onLayerSelectWithRectEnd]);

  const selectionModeEventsOn = useCallback(
    <T extends keyof SelectionModeEventType>(
      type: T,
      callback: (...args: SelectionModeEventType[T]) => void,
      options?: { once?: boolean }
    ) => {
      return options?.once
        ? selectionModeEvents.once(type, callback)
        : selectionModeEvents.on(type, callback);
    },
    [selectionModeEvents]
  );

  const selectionModeEventsOff = useCallback(
    <T extends keyof SelectionModeEventType>(
      type: T,
      callback: (...args: SelectionModeEventType[T]) => void
    ) => {
      return selectionModeEvents.off(type, callback);
    },
    [selectionModeEvents]
  );

  const getInteractionMode = useGet(
    useMemo<InteractionMode>(
      () => ({
        mode: interactionMode ?? "default",
        override: overrideInteractionMode,
        selectionMode: {
          on: selectionModeEventsOn,
          off: selectionModeEventsOff
        }
      }),
      [
        interactionMode,
        overrideInteractionMode,
        selectionModeEventsOn,
        selectionModeEventsOff
      ]
    )
  );

  const getInEditor = useGet(!!inEditor);

  const getIsBuilt = useGet(!!built);

  const getLocationFromScreenCoordinate = useCallback(
    (x: number, y: number, withTerrain?: boolean) => {
      return engineRef?.getLocationFromScreen(x, y, withTerrain);
    },
    [engineRef]
  );

  const getScreenCoordinateFromPosition = useCallback(
    (position: [x: number, y: number, z: number]) => {
      return engineRef?.toWindowPosition(position);
    },
    [engineRef]
  );

  const getTerrainHeightAsync = useCallback(
    async (lng: number, lat: number) => {
      return await engineRef?.sampleTerrainHeight(lng, lat);
    },
    [engineRef]
  );

  const getGlobeHeight = useCallback(
    (lng: number, lat: number, height?: number) => {
      return engineRef?.computeGlobeHeight(lng, lat, height);
    },
    [engineRef]
  );

  const getGlobeHeightByCamera = useCallback(() => {
    return engineRef?.getGlobeHeight();
  }, [engineRef]);

  const cartographicToCartesian = useCallback(
    (
      lng: number,
      lat: number,
      height: number,
      options?:
        | {
            useGlobeEllipsoid?: boolean | undefined;
          }
        | undefined
    ) => {
      return engineRef?.toXYZ(lng, lat, height, options);
    },
    [engineRef]
  );

  const cartesianToCartographic = useCallback(
    (
      x: number,
      y: number,
      z: number,
      options?:
        | {
            useGlobeEllipsoid?: boolean | undefined;
          }
        | undefined
    ) => {
      return engineRef?.toLngLatHeight(x, y, z, options);
    },
    [engineRef]
  );

  const transformByOffsetOnScreen = useCallback(
    (
      rawPosition: [x: number, y: number, z: number],
      screenOffset: [x: number, y: number]
    ) => {
      return engineRef?.convertScreenToPositionOffset(
        rawPosition,
        screenOffset
      );
    },
    [engineRef]
  );

  const isPositionVisibleOnGlobe = useCallback(
    (position: [x: number, y: number, z: number]) => {
      return !!engineRef?.isPositionVisible(position);
    },
    [engineRef]
  );

  const getGeoidHeight = useCallback(
    async (lng?: number, lat?: number) => {
      return await geoidRef?.getGeoidHeight(lng, lat);
    },
    [geoidRef]
  );

  const getCurrentLocationAsync = useCallback(
    async (options?: {
      enableHighAccuracy?: boolean;
      timeout?: number;
      maximumAge?: number;
    }) => {
      return new Promise<
        { lat: number; lng: number; height: number } | undefined
      >((resolve) => {
        if (!navigator.geolocation) {
          resolve(undefined);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              height: position.coords.altitude ?? 0
            });
          },
          () => {
            resolve(undefined);
          },
          {
            enableHighAccuracy: options?.enableHighAccuracy ?? false,
            timeout: options?.timeout ?? 10000,
            maximumAge: options?.maximumAge ?? 0
          }
        );
      });
    },
    []
  );

  // events
  const [viewerEvents, emit] = useMemo(() => events<ViewerEventType>(), []);

  useEmit<Pick<ViewerEventType, "resize">>(
    {
      resize: useMemo<[viewport: ViewportSize] | undefined>(
        () => [
          {
            width: viewport?.width,
            height: viewport?.height,
            isMobile: viewport?.isMobile
          } as ViewportSize
        ],
        [viewport?.width, viewport?.height, viewport?.isMobile]
      )
    },
    emit
  );

  const onMouseEvent = useCallback(
    (eventType: keyof MouseEventHandles, fn: any) => {
      mapRef?.current?.engine[eventType]?.(fn);
    },
    [mapRef]
  );

  useEffect(() => {
    const mouseEventHandles: {
      [index in keyof MouseEvents]: keyof MouseEventHandles;
    } = {
      click: "onClick",
      doubleClick: "onDoubleClick",
      mouseDown: "onMouseDown",
      mouseUp: "onMouseUp",
      rightClick: "onRightClick",
      rightDown: "onRightDown",
      rightUp: "onRightUp",
      middleClick: "onMiddleClick",
      middleDown: "onMiddleDown",
      middleUp: "onMiddleUp",
      mouseMove: "onMouseMove",
      mouseEnter: "onMouseEnter",
      mouseLeave: "onMouseLeave",
      wheel: "onWheel"
    };
    (Object.keys(mouseEventHandles) as (keyof MouseEvents)[]).forEach(
      (event: keyof MouseEvents) => {
        onMouseEvent(mouseEventHandles[event], (props: MouseEvent) => {
          emit(event, props);
        });
      }
    );
  }, [emit, onMouseEvent]);

  const viewerEventsOn = useCallback(
    <T extends keyof ViewerEventType>(
      type: T,
      callback: (...args: ViewerEventType[T]) => void,
      options?: { once?: boolean }
    ) => {
      return options?.once
        ? viewerEvents.once(type, callback)
        : viewerEvents.on(type, callback);
    },
    [viewerEvents]
  );

  const viewerEventsOff = useCallback(
    <T extends keyof ViewerEventType>(
      type: T,
      callback: (...args: ViewerEventType[T]) => void
    ) => {
      return viewerEvents.off(type, callback);
    },
    [viewerEvents]
  );

  return {
    getViewerProperty,
    overrideViewerPropertyCommon,
    getViewport,
    captureScreen,
    getInteractionMode,
    getInEditor,
    getIsBuilt,
    getLocationFromScreenCoordinate,
    getScreenCoordinateFromPosition,
    getTerrainHeightAsync,
    getGlobeHeight,
    getGlobeHeightByCamera,
    cartographicToCartesian,
    cartesianToCartographic,
    transformByOffsetOnScreen,
    isPositionVisibleOnGlobe,
    getGeoidHeight,
    getCurrentLocationAsync,
    viewerEventsOn,
    viewerEventsOff,
    viewerEvents,
    selectionModeEvents
  };
};
