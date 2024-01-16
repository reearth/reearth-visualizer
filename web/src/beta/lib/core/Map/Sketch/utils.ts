import { Cartesian3, type PolygonHierarchy, type Scene } from "@cesium/engine";
import unkinkPolygon from "@turf/unkink-polygon";
import { type LineString, type MultiPolygon, type Polygon, type Position } from "geojson";
import { useRef, type ForwardedRef, useEffect } from "react";

export function isNotNullish<T>(value: T | null | undefined): value is T {
  return value != null;
}

function coordinatesToPositionsArray(coordinates: readonly Position[][]): Cartesian3[][] {
  return coordinates.map(coordinates =>
    coordinates.map(([x, y]) => Cartesian3.fromDegrees(x, y, 0)),
  );
}

export function convertGeometryToPositionsArray(
  geometry: LineString | Polygon | MultiPolygon,
): Cartesian3[][] {
  return (
    geometry.type === "LineString"
      ? coordinatesToPositionsArray([geometry.coordinates])
      : geometry.type === "Polygon"
      ? coordinatesToPositionsArray(geometry.coordinates)
      : geometry.coordinates.flatMap(coordinates => coordinatesToPositionsArray(coordinates))
  ).filter(({ length }) => length > 0);
}

function coordinatesToHierarchy(coordinates: readonly Position[][]): PolygonHierarchy | undefined {
  return coordinates.length > 0
    ? {
        positions: coordinates[0].map(([x, y]) => Cartesian3.fromDegrees(x, y, 0)),
        holes: coordinates.slice(1).map(coordinates => ({
          positions: coordinates.map(([x, y]) => Cartesian3.fromDegrees(x, y, 0)),
          holes: [],
        })),
      }
    : undefined;
}

export function convertPolygonToHierarchyArray(
  polygon: Polygon | MultiPolygon,
): PolygonHierarchy[] {
  const polygons = unkinkPolygon(polygon).features;
  return polygons
    .map(polygon => coordinatesToHierarchy(polygon.geometry.coordinates))
    .filter(isNotNullish);
}

export function requestRenderInNextFrame(scene: Scene): void {
  const removeListener = scene.preRender.addEventListener(() => {
    scene.requestRender();
    removeListener();
  });
}

export function assignForwardedRef<T>(
  forwardedRef: ForwardedRef<T> | undefined,
  value: T | null,
): (() => void) | undefined {
  if (typeof forwardedRef === "function") {
    forwardedRef(value);
    return () => {
      forwardedRef(null);
    };
  } else if (forwardedRef != null) {
    forwardedRef.current = value;
    return () => {
      forwardedRef.current = null;
    };
  }
  return;
}

export function useWindowEvent<K extends keyof WindowEventMap>(
  eventName: K,
  callback: (event: WindowEventMap[K]) => void,
  options?: EventListenerOptions,
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const optionsRef = useRef(options);
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const listener = (event: WindowEventMap[K]): void => {
      callbackRef.current?.(event);
    };
    const options = optionsRef.current;
    window.addEventListener(eventName, listener, options);
    return () => {
      window.removeEventListener(eventName, listener, options);
    };
  }, [eventName]);
}
