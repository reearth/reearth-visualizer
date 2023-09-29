import { RefObject, useMemo } from "react";

import { TimelineCommiter, TimelineManager } from "../Visualizer/useTimelineManager";

import { Camera, MapRef, SceneProperty } from "./types";
import { Context as WidgetContext } from "./Widgets";

export const useWidgetContext = ({
  mapRef,
  camera,
  selectedLayerId,
  sceneProperty,
  timelineManager,
}: Parameters<typeof widgetContextFromMapRef>[0]) =>
  useMemo(
    () =>
      widgetContextFromMapRef({
        mapRef,
        camera,
        selectedLayerId,
        sceneProperty,
        timelineManager,
      }),
    [camera, mapRef, sceneProperty, selectedLayerId, timelineManager],
  );

export function widgetContextFromMapRef({
  mapRef,
  camera,
  selectedLayerId,
  sceneProperty,
  timelineManager,
}: {
  mapRef?: RefObject<MapRef>;
  camera?: Camera;
  selectedLayerId?: {
    layerId?: string;
    featureId?: string;
  };
  sceneProperty?: SceneProperty;
  timelineManager?: TimelineManager;
}): WidgetContext {
  const engine = () => mapRef?.current?.engine;
  const layers = () => mapRef?.current?.layers;

  return {
    camera,
    get clock() {
      return engine()?.getClock();
    },
    timelineManager,
    initialCamera: sceneProperty?.default?.camera,
    is2d: sceneProperty?.default?.sceneMode === "2d",
    selectedLayerId,
    findPhotooverlayLayer: (id: string) => {
      const l = layers()?.findById(id);
      if (!l || l.type !== "simple") {
        return undefined;
      }
      // For compat
      const location = l.property?.default?.location ?? l.property?.default?.position;
      return {
        title: l.title,
        lat: location?.lat,
        lng: location?.lng,
        height: location?.height ?? 0,
      };
    },
    onCameraOrbit: (...args) => engine()?.orbit(...args),
    onCameraRotateRight: (...args) => engine()?.rotateRight(...args),
    onFlyTo: (...args) => engine()?.flyTo(...args),
    onLookAt: (...args) => engine()?.lookAt(...args),
    onLayerSelect: (...args) => layers()?.select(...args),
    onPause: (commiter?: TimelineCommiter) =>
      timelineManager?.commit({
        cmd: "PAUSE",
        commiter: { source: commiter?.source ?? "widgetContext", id: commiter?.id },
      }),
    onPlay: (commiter?: TimelineCommiter) =>
      timelineManager?.commit({
        cmd: "PLAY",
        commiter: { source: commiter?.source ?? "widgetContext", id: commiter?.id },
      }),
    onSpeedChange: (speed, commiter?: TimelineCommiter) =>
      timelineManager?.commit({
        cmd: "UPDATE",
        payload: {
          multiplier: speed,
          stepType: "rate",
        },
        commiter: { source: commiter?.source ?? "widgetContext", id: commiter?.id },
      }),
    onTick: cb => timelineManager?.onTick(cb),
    removeTickEventListener: cb => timelineManager?.offTick(cb),
    onTimeChange: (time, commiter?: TimelineCommiter) =>
      timelineManager?.commit({
        cmd: "UPDATE",
        payload: {
          current: time,
        },
        commiter: { source: commiter?.source ?? "widgetContext", id: commiter?.id },
      }),
    onZoomIn: (...args) => engine()?.zoomIn(...args),
    onZoomOut: (...args) => engine()?.zoomOut(...args),
  };
}
