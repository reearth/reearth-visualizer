import { SketchFeature } from "@reearth/core";
import * as turf from "@turf/turf";

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
    return (l.features ?? []).flatMap((f: RouteFeature) =>
      extractLines(f.geometry)
    );
  return [];
};

export function dividesRoute(route: any): { lat: number; lng: number }[] {
  if (turf.getType(route) !== "LineString") return [];

  return turf
    .coordAll(turf.lineChunk(route, 0.05, { units: "kilometers" }))
    .reduce<{ lat: number; lng: number }[]>((acc, [lng, lat]) => {
      const last = acc[acc.length - 1];
      if (!last || last.lat !== lat || last.lng !== lng) {
        acc.push({ lat, lng });
      }
      return acc;
    }, []);
}
