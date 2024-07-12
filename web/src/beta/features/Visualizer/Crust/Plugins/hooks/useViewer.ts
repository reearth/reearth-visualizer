import { useCallback, useMemo } from "react";

import { useGet } from "../../utils";
import { InteractionMode, Viewport } from "../pluginAPI/types";
import { Props } from "../types";

export default ({
  viewerProperty,
  overrideViewerProperty,
  viewport,
  mapRef,
  interactionMode,
  overrideInteractionMode,
  inEditor,
  built,
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
>) => {
  const engineRef = mapRef?.current?.engine;

  const getViewerProperty = useGet(viewerProperty);

  const overrideViewerPropertyCommon = useCallback(
    (property: any) => {
      return overrideViewerProperty?.("", property);
    },
    [overrideViewerProperty],
  );

  const getViewport = useGet(viewport as Viewport);

  const captureScreen = useCallback(
    (type?: string, encoderOptions?: number) => {
      return engineRef?.captureScreen(type, encoderOptions);
    },
    [engineRef],
  );

  const getInteractionMode = useGet(
    useMemo<InteractionMode>(
      () => ({ mode: interactionMode ?? "default", override: overrideInteractionMode }),
      [interactionMode, overrideInteractionMode],
    ),
  );

  const getInEditor = useGet(!!inEditor);

  const getIsBuilt = useGet(!!built);

  const getLocationFromScreenCoordinate = useCallback(
    (x: number, y: number, withTerrain?: boolean) => {
      return engineRef?.getLocationFromScreen(x, y, withTerrain);
    },
    [engineRef],
  );

  const getScreenCoordinateFromPosition = useCallback(
    (position: [x: number, y: number, z: number]) => {
      return engineRef?.toWindowPosition(position);
    },
    [engineRef],
  );

  const getTerrainHeightAsync = useCallback(
    async (lng: number, lat: number) => {
      return await engineRef?.sampleTerrainHeight(lng, lat);
    },
    [engineRef],
  );

  const getGlobeHeight = useCallback(
    (lng: number, lat: number, height?: number) => {
      return engineRef?.computeGlobeHeight(lng, lat, height);
    },
    [engineRef],
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
        | undefined,
    ) => {
      return engineRef?.toXYZ(lng, lat, height, options);
    },
    [engineRef],
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
        | undefined,
    ) => {
      return engineRef?.toLngLatHeight(x, y, z, options);
    },
    [engineRef],
  );

  const transformByOffsetOnScreen = useCallback(
    (rawPosition: [x: number, y: number, z: number], screenOffset: [x: number, y: number]) => {
      return engineRef?.convertScreenToPositionOffset(rawPosition, screenOffset);
    },
    [engineRef],
  );

  const isPositionVisibleOnGlobe = useCallback(
    (position: [x: number, y: number, z: number]) => {
      return !!engineRef?.isPositionVisible(position);
    },
    [engineRef],
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
  };
};
