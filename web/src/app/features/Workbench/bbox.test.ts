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
    const line = Array.from({ length: 500_000 }, (_, i) => [i % 360, i % 90]);
    expect(layerBBox([{ geometry: { coordinates: line } }])).toEqual([
      0, 0, 359, 89
    ]);
  });

  test("returns undefined without coordinates", () => {
    expect(layerBBox(undefined)).toBeUndefined();
    expect(layerBBox([])).toBeUndefined();
    expect(layerBBox([{ geometry: {} }, {}])).toBeUndefined();
  });
});
