import { getCoord as turfGetCoord, getCoords as turfGetCoords } from "@turf/turf";
import type { Geometry, GeometryCollection } from "geojson";

export const getCoord = wrap(turfGetCoord);
export const getCoords = wrap(turfGetCoords);

export const getGeom = (g: any): Exclude<Geometry, GeometryCollection<Geometry>> | undefined => {
  if (typeof g !== "object" || !g || !("type" in g)) return;

  if (g.type === "Feature") return getGeom(g.geometry);

  if (
    g.type !== "Point" &&
    g.type !== "MultiPoint" &&
    g.type !== "LineString" &&
    g.type !== "MultiLineString" &&
    g.type !== "Polygon" &&
    g.type !== "MultiPolygon"
  )
    return;

  return g;
};

function wrap<T>(f: (d: any) => T): (d: any) => T | undefined {
  return (d: any) => {
    try {
      return f(d);
    } catch {
      return;
    }
  };
}

/**
 * Often we want to make an array of keys of an object type,
 * but if we just specify the key names directly, we may forget to change the array if the object type is changed.
 * With this function, the compiler checks the object keys for completeness, so the array of keys is always up to date.
 */
export function objKeys<T extends string | number | symbol>(obj: { [k in T]: 1 }): T[] {
  return Object.keys(obj) as T[];
}
