import { Ellipsoid } from "@cesium/engine";

// See https://www.gsi.go.jp/sokuchikijun/datum-main.html#p2
export const SEMI_MAJOR_RADIUS = 6378137;
export const ECCENTRICITY = 1 / 298.257222101;
export const SEMI_MINOR_RADIUS = (1 - ECCENTRICITY) * SEMI_MAJOR_RADIUS;

// Geoidal height of Japanese datum of leveling.
export const GEOIDAL_HEIGHT = 36.7071;

// A shape offset from an ellipsoid is not an ellipsoid unless it's a sphere;
// this is just an approximation.
export const JapanSeaLevelEllipsoid = Object.assign(
  new Ellipsoid(
    SEMI_MAJOR_RADIUS + GEOIDAL_HEIGHT,
    SEMI_MAJOR_RADIUS + GEOIDAL_HEIGHT,
    SEMI_MINOR_RADIUS + GEOIDAL_HEIGHT,
  ),
  { geoidalHeight: GEOIDAL_HEIGHT },
);
