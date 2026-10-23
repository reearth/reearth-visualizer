import { describe, expect, test } from "vitest";

import { layerBBox } from "./bbox";

const point = (lng: number, lat: number) => ({
  geometry: { coordinates: [lng, lat] }
});

describe("layerBBox", () => {
  test("covers every feature", () => {
    expect(layerBBox([point(139.7, 35.6), point(139.8, 35.7)])).toEqual([
      139.7, 35.6, 139.8, 35.7
    ]);
  });

  test("gives a single point a small extent", () => {
    const bbox = layerBBox([point(139.7, 35.6)]);
    if (!bbox) throw new Error("no bbox");
    const [w, s, e, n] = bbox;
    expect(e - w).toBeCloseTo(0.01);
    expect(n - s).toBeCloseTo(0.01);
    expect((w + e) / 2).toBeCloseTo(139.7);
    expect((s + n) / 2).toBeCloseTo(35.6);
  });

  test("reads lines, polygons and geometry collections", () => {
    const bbox = layerBBox([
      {
        geometry: {
          coordinates: [
            [
              [0, 0],
              [1, 0],
              [1, 2],
              [0, 0]
            ]
          ]
        }
      },
      {
        geometry: {
          geometries: [
            { coordinates: [5, 6] },
            {
              coordinates: [
                [7, 8],
                [9, 3]
              ]
            }
          ]
        }
      }
    ]);
    expect(bbox).toEqual([0, 0, 9, 8]);
  });

  test("handles a layer with a very large number of vertices", () => {
    const line = Array.from({ length: 500_000 }, (_, i) => [i % 180, i % 90]);
    expect(layerBBox([{ geometry: { coordinates: line } }])).toEqual([
      0, 0, 179, 89
    ]);
  });

  test("takes the short way across the antimeridian", () => {
    // Fiji: from 177E to 178W (-178).
    const bbox = layerBBox([
      point(177, -17),
      point(-178, -16),
      point(179.5, -18)
    ]);
    expect(bbox).toEqual([177, -18, -178, -16]);
  });

  test("keeps a box that does not cross the antimeridian as it is", () => {
    expect(layerBBox([point(-170, 0), point(170, 1)])).not.toEqual([
      -170, 0, 170, 1
    ]);
    expect(layerBBox([point(-10, 0), point(10, 1)])).toEqual([-10, 0, 10, 1]);
  });

  test("treats longitudes outside [-180, 180] as the same place", () => {
    expect(layerBBox([point(190, 0), point(200, 1)])).toEqual([
      -170, 0, -160, 1
    ]);
  });

  test("returns undefined without coordinates", () => {
    expect(layerBBox(undefined)).toBeUndefined();
    expect(layerBBox([])).toBeUndefined();
    expect(layerBBox([{ geometry: {} }, {}])).toBeUndefined();
  });
});
