import { RefObject, useMemo } from "react";

import { TimelineAPI, TimelineCommitter } from "../Map/useTimelineManager";

import { Camera, MapRef, SceneProperty } from "./types";
import { Context as WidgetContext } from "./Widgets";

export const useWidgetContext = ({
  mapRef,
  camera,
  selectedLayerId,
  sceneProperty,
  timelineAPI,
}: Parameters<typeof widgetContextFromMapRef>[0]) =>
  useMemo(
    () =>
      widgetContextFromMapRef({
        mapRef,
        camera,
        selectedLayerId,
        sceneProperty,
        timelineAPI,
      }),
    [camera, mapRef, sceneProperty, selectedLayerId, timelineAPI],
  );

export function widgetContextFromMapRef({
  mapRef,
  camera,
  selectedLayerId,
  sceneProperty,
  timelineAPI,
}: {
  mapRef?: RefObject<MapRef>;
  camera?: Camera;
  selectedLayerId?: {
    layerId?: string;
    featureId?: string;
  };
  sceneProperty?: SceneProperty;
  timelineAPI?: TimelineAPI;
}): WidgetContext {
  const engine = () => mapRef?.current?.engine;
  const layers = () => mapRef?.current?.layers;

  return {
    camera,
    get clock() {
      return engine()?.getClock();
    },
    timelineAPI,
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
    onPause: (committer?: TimelineCommitter) =>
      timelineAPI?.current?.commit({
        cmd: "PAUSE",
        committer: { source: committer?.source ?? "widgetContext", id: committer?.id },
      }),
    onPlay: (committer?: TimelineCommitter) =>
      timelineAPI?.current?.commit({
        cmd: "PLAY",
        committer: { source: committer?.source ?? "widgetContext", id: committer?.id },
      }),
    onSpeedChange: (speed, committer?: TimelineCommitter) =>
      timelineAPI?.current?.commit({
        cmd: "SET_OPTIONS",
        payload: {
          multiplier: speed,
          stepType: "rate",
        },
        committer: { source: committer?.source ?? "widgetContext", id: committer?.id },
      }),
    onTick: cb => timelineAPI?.current?.onTick(cb),
    removeTickEventListener: cb => timelineAPI?.current?.offTick(cb),
    onTimeChange: (time, committer?: TimelineCommitter) =>
      timelineAPI?.current?.commit({
        cmd: "SET_TIME",
        payload: {
          current: time,
        },
        committer: { source: committer?.source ?? "widgetContext", id: committer?.id },
      }),
    onZoomIn: (...args) => engine()?.zoomIn(...args),
    onZoomOut: (...args) => engine()?.zoomOut(...args),
  };
}
