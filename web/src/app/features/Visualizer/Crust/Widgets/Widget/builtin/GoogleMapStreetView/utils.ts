import { SketchFeature } from "@reearth/core";

import { RouteFeature } from "./types";

type RouteCoords = [number, number][];

export const toRouteFeature = (
  input: SketchFeature | RouteCoords
): RouteFeature | undefined => {
  if (Array.isArray(input)) {
    return {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: input
      }
    };
  }

  if (input.geometry.type !== "LineString") return;
  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: input.geometry.coordinates.map(([lng, lat]) => [lng, lat])
    }
  };
};

export function normalizeHex(input: string) {
  let v = input.trim();
  if (!v) return "#FFFFFF";
  if (!v.startsWith("#")) v = `#${v}`;
  v = v.toUpperCase().slice(0, 7);
  if (v.length === 1) return "#";
  return v;
}

export const extractLines = (l: any): [number, number][][] => {
  if (l?.type === "LineString") return [l.coordinates ?? []];
  if (l?.type === "MultiLineString") return l.coordinates ?? [];
  if (l?.type === "FeatureCollection")
    return (l.features ?? []).flatMap((f: any) => extractLines(f.geometry));
  return [];
};
