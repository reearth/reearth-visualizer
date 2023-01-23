import { RefObject, useMemo } from "react";

import { Camera, Clock, MapRef, SceneProperty } from "./types";
import { Context as WidgetContext } from "./Widgets";

export const useWidgetContext = ({
  mapRef,
  clock,
  camera,
  selectedLayerId,
  sceneProperty,
}: Parameters<typeof widgetContextFromMapRef>[0]) =>
  useMemo(
    () =>
      widgetContextFromMapRef({
        mapRef,
        clock,
        camera,
        selectedLayerId,
        sceneProperty,
      }),
    [camera, clock, mapRef, sceneProperty, selectedLayerId],
  );

export function widgetContextFromMapRef({
  mapRef,
  clock,
  camera,
  selectedLayerId,
  sceneProperty,
}: {
  mapRef?: RefObject<MapRef>;
  clock?: Clock;
  camera?: Camera;
  selectedLayerId?: {
    layerId?: string;
    featureId?: string;
  };
  sceneProperty?: SceneProperty;
}): WidgetContext {
  const engine = () => mapRef?.current?.engine;
  const layers = () => mapRef?.current?.layers;

  return {
    camera,
    clock,
    is2d: sceneProperty?.default?.sceneMode === "2d",
    selectedLayerId,
    findPhotooverlayLayer: (id: string) => {
      const l = layers()?.findById(id);
      if (
        !l ||
        l.type !== "simple" ||
        !l.photooverlay?.location ||
        !("lat" in l.photooverlay.location)
      ) {
        return undefined;
      }
      return {
        title: l.title,
        lat: l.photooverlay.location.lat,
        lng: l.photooverlay.location.lng,
        height: typeof l.photooverlay?.height === "number" ? l.photooverlay.height : 0,
      };
    },
    onCameraOrbit: (...args) => engine()?.orbit(...args),
    onCameraRotateRight: (...args) => engine()?.rotateRight(...args),
    onFlyTo: (...args) => engine()?.flyTo(...args),
    onLookAt: (...args) => engine()?.lookAt(...args),
    onLayerSelect: (...args) => layers()?.select(...args),
    onPause: (...args) => engine()?.pause(...args),
    onPlay: (...args) => engine()?.play(...args),
    onSpeedChange: (...args) => engine()?.changeSpeed(...args),
    onTick: (...args) => engine()?.tick(...args),
    onTimeChange: (...args) => engine()?.changeTime(...args),
    onZoomIn: (...args) => engine()?.zoomIn(...args),
    onZoomOut: (...args) => engine()?.zoomOut(...args),
  };
}
