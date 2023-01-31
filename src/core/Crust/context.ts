import { RefObject, useMemo } from "react";

import { Camera, MapRef, SceneProperty } from "./types";
import { Context as WidgetContext } from "./Widgets";

export const useWidgetContext = ({
  mapRef,
  camera,
  selectedLayerId,
  sceneProperty,
}: Parameters<typeof widgetContextFromMapRef>[0]) =>
  useMemo(
    () =>
      widgetContextFromMapRef({
        mapRef,
        camera,
        selectedLayerId,
        sceneProperty,
      }),
    [camera, mapRef, sceneProperty, selectedLayerId],
  );

export function widgetContextFromMapRef({
  mapRef,
  camera,
  selectedLayerId,
  sceneProperty,
}: {
  mapRef?: RefObject<MapRef>;
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
    get clock() {
      return engine()?.getClock();
    },
    initialCamera: sceneProperty?.default?.camera,
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
    onTick: (...args) => engine()?.onTick(...args),
    removeTickEventListener: (...args) => engine()?.removeTickEventListener(...args),
    onTimeChange: (...args) => engine()?.changeTime(...args),
    onZoomIn: (...args) => engine()?.zoomIn(...args),
    onZoomOut: (...args) => engine()?.zoomOut(...args),
  };
}
