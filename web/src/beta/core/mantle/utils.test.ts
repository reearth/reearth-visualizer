import { expect, test } from "vitest";

import { getCoord, getCoords, getGeom } from "./utils";

test("getCoord", () => {
  expect(getCoord("a")).toBeUndefined();
  expect(getCoord({ type: "Point", coordinates: [1, 2] })).toEqual([1, 2]);
  expect(getCoord({ type: "Feature", geometry: { type: "Point", coordinates: [1, 2] } })).toEqual([
    1, 2,
  ]);
  expect(getCoord({ type: "LineString", coordinates: [[1, 2]] })).toBeUndefined();
  expect(getCoord({ type: "Polygon", coordinates: [[[1, 2]]] })).toBeUndefined();
  expect(
    getCoord({
      type: "FeatureCollection",
      features: [{ type: "Feature", geometry: { type: "Point", coordinates: [1, 2] } }],
    }),
  ).toBeUndefined();
});

test("getCoords", () => {
  expect(getCoords("a")).toBeUndefined();
  expect(getCoords({ type: "Point", coordinates: [1, 2] })).toEqual([1, 2]);
  expect(getCoords({ type: "Feature", geometry: { type: "Point", coordinates: [1, 2] } })).toEqual([
    1, 2,
  ]);
  expect(getCoords({ type: "LineString", coordinates: [[1, 2]] })).toEqual([[1, 2]]);
  expect(
    getCoords({
      type: "Polygon",
      coordinates: [
        [
          [1, 2],
          [2, 3],
        ],
      ],
    }),
  ).toEqual([
    [
      [1, 2],
      [2, 3],
    ],
  ]);
  expect(
    getCoords({
      type: "FeatureCollection",
      features: [{ type: "Feature", geometry: { type: "Point", coordinates: [1, 2] } }],
    }),
  ).toBeUndefined();
});

test("getGeom", () => {
  expect(getGeom("a")).toBeUndefined();
  expect(getGeom({ type: "Point", coordinates: [1, 2] })).toEqual({
    type: "Point",
    coordinates: [1, 2],
  });
  expect(getGeom({ type: "Feature", geometry: { type: "Point", coordinates: [1, 2] } })).toEqual({
    type: "Point",
    coordinates: [1, 2],
  });
  expect(
    getGeom({
      type: "GeometryCollection",
      geometries: [{ type: "Point", coordinates: [1, 2] }],
    }),
  ).toBeUndefined();
  expect(
    getGeom({
      type: "FeatureCollection",
      features: [{ type: "Feature", geometry: { type: "Point", coordinates: [1, 2] } }],
    }),
  ).toBeUndefined();
});
