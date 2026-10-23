/** [west, south, east, north] in degrees. West is greater than east when the box crosses the antimeridian. */
export type BBox = [number, number, number, number];

// Longitudes are tracked in two frames, [-180, 180) and [0, 360), so that a
// layer that crosses the antimeridian (Fiji, Chukotka) gets the short way
// around instead of a box spanning the globe. No coordinate list is kept, so
// layers with any number of vertices are fine.
type Extent = {
  west: number;
  east: number;
  shiftedWest: number;
  shiftedEast: number;
  south: number;
  north: number;
};

// Longitudes already in range are returned as they are, without rounding.
const wrap = (lng: number) =>
  lng >= -180 && lng <= 180 ? lng : ((((lng + 180) % 360) + 360) % 360) - 180;

/** Widens the extent with every position found in a GeoJSON coordinates tree. */
const extend = (coords: unknown, ext: Extent): void => {
  if (!Array.isArray(coords)) return;
  if (typeof coords[0] === "number" && typeof coords[1] === "number") {
    const lng = wrap(coords[0]);
    const shifted = lng < 0 ? lng + 360 : lng;
    ext.west = Math.min(ext.west, lng);
    ext.east = Math.max(ext.east, lng);
    ext.shiftedWest = Math.min(ext.shiftedWest, shifted);
    ext.shiftedEast = Math.max(ext.shiftedEast, shifted);
    ext.south = Math.min(ext.south, coords[1]);
    ext.north = Math.max(ext.north, coords[1]);
    return;
  }
  coords.forEach((c) => extend(c, ext));
};

type GeometryLike = { coordinates?: unknown; geometries?: GeometryLike[] };

const extendByGeometry = (
  geometry: GeometryLike | undefined,
  ext: Extent
): void => {
  extend(geometry?.coordinates, ext);
  // A GeometryCollection keeps its parts in `geometries`.
  geometry?.geometries?.forEach((g) => extendByGeometry(g, ext));
};

// A single point has no extent, and the camera would fly in to the ground.
const MIN_SPAN = 0.01;

/** The bounds of the features' geometries. */
export const layerBBox = (
  features: { geometry?: GeometryLike }[] | undefined
): BBox | undefined => {
  const ext: Extent = {
    west: Infinity,
    east: -Infinity,
    shiftedWest: Infinity,
    shiftedEast: -Infinity,
    south: Infinity,
    north: -Infinity
  };
  features?.forEach((f) => extendByGeometry(f.geometry, ext));
  if (!Number.isFinite(ext.west)) return undefined;

  const crosses = ext.shiftedEast - ext.shiftedWest < ext.east - ext.west;
  const [west, east] = crosses
    ? [ext.shiftedWest, ext.shiftedEast]
    : [ext.west, ext.east];
  const padX = Math.max(0, MIN_SPAN - (east - west)) / 2;
  const padY = Math.max(0, MIN_SPAN - (ext.north - ext.south)) / 2;
  return [
    wrap(west - padX),
    ext.south - padY,
    wrap(east + padX),
    ext.north + padY
  ];
};
