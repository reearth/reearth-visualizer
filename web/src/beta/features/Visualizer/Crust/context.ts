import { RefObject, useMemo } from "react";

import { TimelineManagerRef, TimelineCommitter, ViewerProperty } from "@reearth/core";

import { MapRef } from "./types";
import { Context as WidgetContext } from "./Widgets";

export const useWidgetContext = ({
  mapRef,
  selectedLayerId,
  viewerProperty,
  timelineManagerRef,
}: Parameters<typeof widgetContextFromMapRef>[0]) =>
  useMemo(
    () =>
      widgetContextFromMapRef({
        mapRef,
        selectedLayerId,
        viewerProperty,
        timelineManagerRef,
      }),
    [mapRef, viewerProperty, selectedLayerId, timelineManagerRef],
  );

export function widgetContextFromMapRef({
  mapRef,
  selectedLayerId,
  viewerProperty,
  timelineManagerRef,
}: {
  mapRef?: RefObject<MapRef>;
  selectedLayerId?: {
    layerId?: string;
    featureId?: string;
  };
  viewerProperty?: ViewerProperty;
  timelineManagerRef?: TimelineManagerRef;
}): WidgetContext {
  const engine = () => mapRef?.current?.engine;
  const layers = () => mapRef?.current?.layers;

  return {
    get clock() {
      return engine()?.getClock();
    },
    timelineManagerRef,
    initialCamera: viewerProperty?.camera?.camera,
    is2d: viewerProperty?.scene?.mode === "2d",
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
    onLayerSelect: (layerId, featureId, options) => {
      layers()?.selectFeatures(
        [{ layerId, featureId: featureId ? [featureId] : undefined }],
        options,
      );
    },
    onPause: (committer?: TimelineCommitter) =>
      timelineManagerRef?.current?.commit({
        cmd: "PAUSE",
        committer: { source: committer?.source ?? "widgetContext", id: committer?.id },
      }),
    onPlay: (committer?: TimelineCommitter) =>
      timelineManagerRef?.current?.commit({
        cmd: "PLAY",
        committer: { source: committer?.source ?? "widgetContext", id: committer?.id },
      }),
    onSpeedChange: (speed, committer?: TimelineCommitter) =>
      timelineManagerRef?.current?.commit({
        cmd: "SET_OPTIONS",
        payload: {
          multiplier: speed,
          stepType: "rate",
        },
        committer: { source: committer?.source ?? "widgetContext", id: committer?.id },
      }),
    onTick: cb => timelineManagerRef?.current?.onTick(cb),
    removeTickEventListener: cb => timelineManagerRef?.current?.offTick(cb),
    onTimeChange: (time, committer?: TimelineCommitter) =>
      timelineManagerRef?.current?.commit({
        cmd: "SET_TIME",
        payload: {
          start: timelineManagerRef.current?.computedTimeline.start,
          current: time,
          stop: timelineManagerRef.current?.computedTimeline.stop,
        },
        committer: { source: committer?.source ?? "widgetContext", id: committer?.id },
      }),
    onZoomIn: (...args) => engine()?.zoomIn(...args),
    onZoomOut: (...args) => engine()?.zoomOut(...args),
  };
}
