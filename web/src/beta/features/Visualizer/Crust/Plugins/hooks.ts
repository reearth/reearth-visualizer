import { useCallback, useEffect, useMemo, useRef } from "react";

import {
  events,
  useGet,
  type MouseEventHandles,
  type MouseEvents,
  type LayerSelectionReason,
  type TickEventCallback,
  type CameraPosition,
  type ComputedFeature,
  type NaiveLayer,
  type SketchType,
  type CameraOptions,
  type FlyTo,
  type FlyToDestination,
  type LookAtDestination,
  type ScreenSpaceCameraControllerOptions,
  type TimelineCommitter,
} from "@reearth/core";

import { useVisualizerCamera } from "../../atoms";

import { commonReearth } from "./api";
import { InteractionMode, ReearthEventType, Viewport, ViewportSize } from "./plugin_types";
import { Context, Props } from "./types";
import useClientStorage from "./useClientStorage";
import usePluginInstances from "./usePluginInstances";

export type SelectedReearthEventType = Pick<
  ReearthEventType,
  | "cameramove"
  | "select"
  | "tick"
  | "timelinecommit"
  | "resize"
  | keyof MouseEvents
  | "layeredit"
  | "sketchfeaturecreated"
  | "sketchtypechange"
  | "layerVisibility"
  | "layerload"
  | "layerSelectWithRectStart"
  | "layerSelectWithRectMove"
  | "layerSelectWithRectEnd"
>;

export default function ({
  engineName,
  mapRef,
  viewerProperty,
  inEditor,
  built,
  // tags,
  viewport,
  selectedLayer,
  selectedFeature,
  layerSelectionReason,
  alignSystem,
  floatingWidgets,
  interactionMode,
  timelineManagerRef,
  selectedStory,
  overrideInteractionMode,
  overrideViewerProperty,
  onLayerEdit,
  onLayerSelectWithRectStart,
  onLayerSelectWithRectMove,
  onLayerSelectWithRectEnd,
  onSketchPluginFeatureCreate,
  onSketchTypeChange,
  onLayerVisibility,
  onLayerLoad,
  onCameraForceHorizontalRollChange,
}: Props) {
  const [ev, emit] = useMemo(() => events<SelectedReearthEventType>(), []);
  const [camera] = useVisualizerCamera();

  const layersRef = mapRef?.current?.layers;
  const engineRef = mapRef?.current?.engine;

  const pluginInstances = usePluginInstances({
    alignSystem,
    floatingWidgets,
    blocks: selectedLayer?.layer?.infobox?.blocks,
    storyBlocks: selectedStory?.pages.flatMap(p => p.blocks),
  });
  const clientStorage = useClientStorage();

  const getLayers = useGet(layersRef);
  const getViewerProperty = useGet(viewerProperty);
  const getInEditor = useGet(!!inEditor);
  const getBuilt = useGet(!!built);
  const getTags = useGet([]);
  const getCamera = useGet(camera);
  const getClock = useCallback(() => {
    return {
      get startTime() {
        return timelineManagerRef?.current?.timeline?.start;
      },
      get stopTime() {
        return timelineManagerRef?.current?.timeline?.stop;
      },
      get currentTime() {
        return timelineManagerRef?.current?.timeline?.current;
      },
      get playing() {
        return !!timelineManagerRef?.current?.options?.animation;
      },
      get paused() {
        return !timelineManagerRef?.current?.options?.animation;
      },
      get speed() {
        return timelineManagerRef?.current?.options?.multiplier;
      },
      get stepType() {
        return timelineManagerRef?.current?.options?.stepType;
      },
      get rangeType() {
        return timelineManagerRef?.current?.options?.rangeType;
      },
      play: () => {
        timelineManagerRef?.current?.commit({
          cmd: "PLAY",
          committer: { source: "pluginAPI", id: "window" },
        });
      },
      pause: () => {
        timelineManagerRef?.current?.commit({
          cmd: "PAUSE",
          committer: { source: "pluginAPI", id: "window" },
        });
      },
      setTime: (time: { start: Date | string; stop: Date | string; current: Date | string }) => {
        timelineManagerRef?.current?.commit({
          cmd: "SET_TIME",
          payload: { ...time },
          committer: { source: "pluginAPI", id: "window" },
        });
      },
      setSpeed: (speed: number) => {
        timelineManagerRef?.current?.commit({
          cmd: "SET_OPTIONS",
          payload: { multiplier: speed },
          committer: { source: "pluginAPI", id: "window" },
        });
      },
      setStepType: (stepType: "rate" | "fixed") => {
        timelineManagerRef?.current?.commit({
          cmd: "SET_OPTIONS",
          payload: { stepType },
          committer: { source: "pluginAPI", id: "window" },
        });
      },
      setRangeType: (rangeType: "unbounded" | "clamped" | "bounced") => {
        timelineManagerRef?.current?.commit({
          cmd: "SET_OPTIONS",
          payload: { rangeType },
          committer: { source: "pluginAPI", id: "window" },
        });
      },
      tick: timelineManagerRef?.current?.tick,
    };
  }, [timelineManagerRef]);
  const getInteractionMode = useGet(
    useMemo<InteractionMode>(
      () => ({ mode: interactionMode, override: overrideInteractionMode }),
      [interactionMode, overrideInteractionMode],
    ),
  );
  const getSketch = useCallback(
    () => ({
      setType: (type: SketchType | undefined) => mapRef?.current?.sketch?.setType(type, "plugin"),
      setColor: mapRef?.current?.sketch?.setColor,
      disableShadow: mapRef?.current?.sketch?.disableShadow,
      enableRelativeHeight: mapRef?.current?.sketch?.enableRelativeHeight,
      setDefaultAppearance: mapRef?.current?.sketch?.setDefaultAppearance,
      createDataOnly: mapRef?.current?.sketch?.createDataOnly,
      allowRightClickToAbort: mapRef?.current?.sketch?.allowRightClickToAbort,
      allowAutoResetInteractionMode: mapRef?.current?.sketch?.allowAutoResetInteractionMode,
    }),
    [mapRef],
  );
  const getPluginInstances = useGet(pluginInstances);
  const getViewport = useGet(viewport as Viewport);
  const getSelectedLayer = useGet(selectedLayer);
  const getSelectedFeature = useGet(selectedFeature);
  const getLayerSelectionReason = useGet(layerSelectionReason);
  const overrideViewerPropertyCommon = useCallback(
    (property: any) => {
      return overrideViewerProperty?.("", property);
    },
    [overrideViewerProperty],
  );

  const flyTo: FlyTo = useCallback(
    (target, options) => {
      engineRef?.flyTo(target, options);
    },
    [engineRef],
  );

  const lookAt = useCallback(
    (dest: LookAtDestination, options?: CameraOptions) => {
      engineRef?.lookAt(dest, options);
    },
    [engineRef],
  );

  const cameraViewport = useCallback(() => {
    return engineRef?.getViewport();
  }, [engineRef]);

  const getCameraFovInfo = useCallback(
    (options: { withTerrain?: boolean; calcViewSize?: boolean }) => {
      return engineRef?.getCameraFovInfo(options);
    },
    [engineRef],
  );

  const layersInViewport = useCallback(() => {
    return layersRef?.findAll(layer => !!engineRef?.inViewport(layer?.property?.default?.location));
  }, [engineRef, layersRef]);

  const zoomIn = useCallback(
    (amount: number) => {
      engineRef?.zoomIn(amount);
    },
    [engineRef],
  );

  const zoomOut = useCallback(
    (amount: number) => {
      engineRef?.zoomOut(amount);
    },
    [engineRef],
  );

  const rotateRight = useCallback(
    (radian: number) => {
      engineRef?.rotateRight(radian);
    },
    [engineRef],
  );

  const orbit = useCallback(
    (radian: number) => {
      engineRef?.orbit(radian);
    },
    [engineRef],
  );

  const captureScreen = useCallback(
    (type?: string, encoderOptions?: number) => {
      return engineRef?.captureScreen(type, encoderOptions);
    },
    [engineRef],
  );

  const getLocationFromScreen = useCallback(
    (x: number, y: number, withTerrain?: boolean) => {
      return engineRef?.getLocationFromScreen(x, y, withTerrain);
    },
    [engineRef],
  );

  const sampleTerrainHeight = useCallback(
    async (lng: number, lat: number) => {
      return await engineRef?.sampleTerrainHeight(lng, lat);
    },
    [engineRef],
  );

  const computeGlobeHeight = useCallback(
    (lng: number, lat: number, height?: number) => {
      return engineRef?.computeGlobeHeight(lng, lat, height);
    },
    [engineRef],
  );

  const getGlobeHeight = useCallback(() => {
    return engineRef?.getGlobeHeight();
  }, [engineRef]);

  const toXYZ = useCallback(
    (
      lng: number,
      lat: number,
      height: number,
      options?:
        | {
            useGlobeEllipsoid?: boolean | undefined;
          }
        | undefined,
    ) => {
      return engineRef?.toXYZ(lng, lat, height, options);
    },
    [engineRef],
  );

  const toLngLatHeight = useCallback(
    (
      x: number,
      y: number,
      z: number,
      options?:
        | {
            useGlobeEllipsoid?: boolean | undefined;
          }
        | undefined,
    ) => {
      return engineRef?.toLngLatHeight(x, y, z, options);
    },
    [engineRef],
  );

  const convertScreenToPositionOffset = useCallback(
    (rawPosition: [x: number, y: number, z: number], screenOffset: [x: number, y: number]) => {
      return engineRef?.convertScreenToPositionOffset(rawPosition, screenOffset);
    },
    [engineRef],
  );

  const isPositionVisible = useCallback(
    (position: [x: number, y: number, z: number]) => {
      return !!engineRef?.isPositionVisible(position);
    },
    [engineRef],
  );

  const setView = useCallback(
    (camera: CameraPosition) => {
      return engineRef?.setView(camera);
    },
    [engineRef],
  );

  const toWindowPosition = useCallback(
    (position: [x: number, y: number, z: number]) => {
      return engineRef?.toWindowPosition(position);
    },
    [engineRef],
  );

  const flyToBBox = useCallback(
    (
      bbox: [number, number, number, number],
      options?: CameraOptions & {
        heading?: number;
        pitch?: number;
        range?: number;
      },
    ) => {
      return engineRef?.flyToBBox(bbox, options);
    },
    [engineRef],
  );

  const rotateOnCenter = useCallback(
    (radian: number) => {
      return engineRef?.rotateOnCenter(radian);
    },
    [engineRef],
  );

  const enableScreenSpaceCameraController = useCallback(
    (enabled: boolean) => engineRef?.enableScreenSpaceCameraController(enabled),
    [engineRef],
  );

  const overrideScreenSpaceController = useCallback(
    (options: ScreenSpaceCameraControllerOptions) => {
      return engineRef?.overrideScreenSpaceController(options);
    },
    [engineRef],
  );
  const lookHorizontal = useCallback(
    (amount: number) => {
      engineRef?.lookHorizontal(amount);
    },
    [engineRef],
  );

  const lookVertical = useCallback(
    (amount: number) => {
      engineRef?.lookVertical(amount);
    },
    [engineRef],
  );

  const moveForward = useCallback(
    (amount: number) => {
      engineRef?.moveForward(amount);
    },
    [engineRef],
  );

  const moveBackward = useCallback(
    (amount: number) => {
      engineRef?.moveBackward(amount);
    },
    [engineRef],
  );

  const moveUp = useCallback(
    (amount: number) => {
      engineRef?.moveUp(amount);
    },
    [engineRef],
  );

  const moveDown = useCallback(
    (amount: number) => {
      engineRef?.moveDown(amount);
    },
    [engineRef],
  );

  const moveLeft = useCallback(
    (amount: number) => {
      engineRef?.moveLeft(amount);
    },
    [engineRef],
  );

  const moveRight = useCallback(
    (amount: number) => {
      engineRef?.moveRight(amount);
    },
    [engineRef],
  );

  const moveOverTerrain = useCallback(
    (offset?: number) => {
      return engineRef?.moveOverTerrain(offset);
    },
    [engineRef],
  );

  const flyToGround = useCallback(
    (dest: FlyToDestination, options?: CameraOptions, offset?: number) => {
      engineRef?.flyToGround(dest, options, offset);
    },
    [engineRef],
  );

  const findFeatureById = useCallback(
    (layerId: string, featureId: string) => {
      return engineRef?.findFeatureById(layerId, featureId);
    },
    [engineRef],
  );

  const findFeaturesByIds = useCallback(
    (layerId: string, featureIds: string[]) => {
      return engineRef?.findFeaturesByIds(layerId, featureIds);
    },
    [engineRef],
  );

  const addLayer = useCallback(
    (layer: NaiveLayer) => {
      return layersRef?.add(layer)?.id;
    },
    [layersRef],
  );

  const overrideLayerProperty = useCallback(
    (id: string, property?: Partial<any> | null | undefined) => {
      layersRef?.override(id, { property });
    },
    [layersRef],
  );

  const selectLayer = useCallback(
    (layerId: string | undefined, reason?: LayerSelectionReason | undefined) => {
      layersRef?.select(layerId, reason);
    },
    [layersRef],
  );

  const selectFeature = useCallback(
    (layerId: string | undefined, featureId: string | undefined) => {
      layersRef?.selectFeature(layerId, featureId);
    },
    [layersRef],
  );

  const selectFeatures = useCallback(
    (layers: { layerId?: string; featureId?: string[] }[]) => {
      layersRef?.selectFeatures(layers);
    },
    [layersRef],
  );

  const showLayer = useCallback(
    (...args: string[]) => {
      layersRef?.show(...args);
    },
    [layersRef],
  );

  const hideLayer = useCallback(
    (...args: string[]) => {
      layersRef?.hide(...args);
    },
    [layersRef],
  );

  const pickManyFromViewport = useCallback(
    (
      windowPosition: [x: number, y: number],
      windowWidth: number,
      windowHeight: number,
      // TODO: Get condition as expression for plugin
      condition?: (f: ComputedFeature) => boolean,
    ) => {
      return engineRef?.pickManyFromViewport(windowPosition, windowWidth, windowHeight, condition);
    },
    [engineRef],
  );

  const bringToFront = useCallback(
    (layerId: string) => {
      return engineRef?.bringToFront(layerId);
    },
    [engineRef],
  );

  const sendToBack = useCallback(
    (layerId: string) => {
      return engineRef?.sendToBack(layerId);
    },
    [engineRef],
  );

  const value = useMemo<Context>(
    () => ({
      reearth: commonReearth({
        engineName,
        events: ev,
        layers: getLayers,
        viewerProperty: getViewerProperty,
        inEditor: getInEditor,
        built: getBuilt,
        tags: getTags,
        camera: getCamera,
        clock: getClock,
        sketch: getSketch,
        interactionMode: getInteractionMode,
        pluginInstances: getPluginInstances,
        viewport: getViewport,
        selectedLayer: getSelectedLayer,
        selectedFeature: getSelectedFeature,
        layerSelectionReason: getLayerSelectionReason,
        showLayer,
        hideLayer,
        addLayer,
        selectLayer,
        selectFeature,
        selectFeatures,
        overrideLayerProperty,
        overrideViewerProperty: overrideViewerPropertyCommon,
        layersInViewport,
        flyTo,
        flyToBBox,
        rotateOnCenter,
        overrideScreenSpaceController,
        lookAt,
        zoomIn,
        zoomOut,
        cameraViewport,
        getCameraFovInfo,
        computeGlobeHeight,
        getGlobeHeight,
        toXYZ,
        toLngLatHeight,
        convertScreenToPositionOffset,
        isPositionVisible,
        setView,
        toWindowPosition,
        rotateRight,
        orbit,
        captureScreen,
        getLocationFromScreen,
        sampleTerrainHeight,
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
        findFeatureById,
        findFeaturesByIds,
        pickManyFromViewport,
        bringToFront,
        sendToBack,
        forceHorizontalRoll: onCameraForceHorizontalRollChange,
      }),
      overrideViewerProperty,
      pluginInstances,
      clientStorage,
      timelineManagerRef,
    }),
    [
      engineName,
      ev,
      getLayers,
      getViewerProperty,
      getInEditor,
      getBuilt,
      getTags,
      getCamera,
      getClock,
      getSketch,
      getInteractionMode,
      getPluginInstances,
      getViewport,
      getSelectedLayer,
      getSelectedFeature,
      getLayerSelectionReason,
      showLayer,
      hideLayer,
      addLayer,
      selectLayer,
      selectFeature,
      selectFeatures,
      overrideLayerProperty,
      overrideViewerPropertyCommon,
      layersInViewport,
      flyTo,
      flyToBBox,
      rotateOnCenter,
      overrideScreenSpaceController,
      lookAt,
      zoomIn,
      zoomOut,
      cameraViewport,
      getCameraFovInfo,
      computeGlobeHeight,
      getGlobeHeight,
      toXYZ,
      toLngLatHeight,
      convertScreenToPositionOffset,
      isPositionVisible,
      setView,
      toWindowPosition,
      rotateRight,
      orbit,
      captureScreen,
      getLocationFromScreen,
      sampleTerrainHeight,
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
      findFeatureById,
      findFeaturesByIds,
      pickManyFromViewport,
      bringToFront,
      sendToBack,
      overrideViewerProperty,
      onCameraForceHorizontalRollChange,
      pluginInstances,
      clientStorage,
      timelineManagerRef,
    ],
  );

  useEmit<SelectedReearthEventType>(
    {
      select: useMemo<[layerId: string | undefined, featureId: string | undefined]>(
        () => (selectedLayer ? [selectedLayer.id, selectedFeature?.id] : [undefined, undefined]),
        [selectedLayer, selectedFeature],
      ),
      cameramove: useMemo<[camera: CameraPosition] | undefined>(
        () => (camera ? [camera] : undefined),
        [camera],
      ),
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

  const onTickEvent = useCallback(
    (fn: TickEventCallback) => {
      timelineManagerRef?.current?.onTick(fn);
    },
    [timelineManagerRef],
  );

  const onTimelineCommitEvent = useCallback(
    (fn: (committer: TimelineCommitter) => void) => {
      timelineManagerRef?.current?.onCommit(fn);
    },
    [timelineManagerRef],
  );

  useEffect(() => {
    const mouseEventHandles: {
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
    (Object.keys(mouseEventHandles) as (keyof MouseEvents)[]).forEach(
      (event: keyof MouseEvents) => {
        onMouseEvent(mouseEventHandles[event], (props: MouseEvent) => {
          emit(event, props);
        });
      },
    );
    onLayerEdit?.(e => {
      emit("layeredit", e);
    });
    onTickEvent(e => {
      emit("tick", e);
    });
    onTimelineCommitEvent(e => {
      emit("timelinecommit", e);
    });
    onLayerVisibility?.(e => {
      emit("layerVisibility", e);
    });
    onLayerLoad?.(e => {
      emit("layerload", e);
    });
    onLayerSelectWithRectStart?.(e => {
      emit("layerSelectWithRectStart", e);
    });
    onLayerSelectWithRectMove?.(e => {
      emit("layerSelectWithRectMove", e);
    });
    onLayerSelectWithRectEnd?.(e => {
      emit("layerSelectWithRectEnd", e);
    });
  }, [
    emit,
    onMouseEvent,
    onLayerEdit,
    onTickEvent,
    onTimelineCommitEvent,
    onLayerVisibility,
    onLayerLoad,
    onLayerSelectWithRectStart,
    onLayerSelectWithRectMove,
    onLayerSelectWithRectEnd,
  ]);

  // bind sketch plugin feature create event
  const sketchPluginFeatureCreateEventBinded = useRef(false);
  useEffect(() => {
    if (!sketchPluginFeatureCreateEventBinded.current && onSketchPluginFeatureCreate) {
      onSketchPluginFeatureCreate?.(e => {
        emit("sketchfeaturecreated", e);
      });
      sketchPluginFeatureCreateEventBinded.current = true;
    }
  }, [emit, onSketchPluginFeatureCreate]);

  // bind sketch type change event
  const sketchTypeChangeEventBinded = useRef(false);
  useEffect(() => {
    if (!sketchTypeChangeEventBinded.current && onSketchTypeChange) {
      onSketchTypeChange?.(e => {
        emit("sketchtypechange", e);
      });
      sketchTypeChangeEventBinded.current = true;
    }
  }, [emit, onSketchTypeChange]);

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
