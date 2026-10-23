export type BBox = [number, number, number, number];

/** Widens the bounds with every position found in a GeoJSON coordinates tree. */
const extendBBox = (coords: unknown, bbox: BBox): void => {
  if (!Array.isArray(coords)) return;
  if (typeof coords[0] === "number" && typeof coords[1] === "number") {
    bbox[0] = Math.min(bbox[0], coords[0]);
    bbox[1] = Math.min(bbox[1], coords[1]);
    bbox[2] = Math.max(bbox[2], coords[0]);
    bbox[3] = Math.max(bbox[3], coords[1]);
    return;
  }
  coords.forEach((c) => extendBBox(c, bbox));
};

type GeometryLike = { coordinates?: unknown; geometries?: GeometryLike[] };

const extendBBoxByGeometry = (
  geometry: GeometryLike | undefined,
  bbox: BBox
): void => {
  extendBBox(geometry?.coordinates, bbox);
  // A GeometryCollection keeps its parts in `geometries`.
  geometry?.geometries?.forEach((g) => extendBBoxByGeometry(g, bbox));
};

// A single point has no extent, and the camera would fly in to the ground.
const MIN_BBOX_SPAN = 0.01;

/** [west, south, east, north] of the features' geometries. */
export const layerBBox = (
  features: { geometry?: GeometryLike }[] | undefined
): BBox | undefined => {
  const bbox: BBox = [Infinity, Infinity, -Infinity, -Infinity];
  features?.forEach((f) => extendBBoxByGeometry(f.geometry, bbox));
  if (!Number.isFinite(bbox[0])) return undefined;
  const padX = Math.max(0, MIN_BBOX_SPAN - (bbox[2] - bbox[0])) / 2;
  const padY = Math.max(0, MIN_BBOX_SPAN - (bbox[3] - bbox[1])) / 2;
  return [bbox[0] - padX, bbox[1] - padY, bbox[2] + padX, bbox[3] + padY];
};
