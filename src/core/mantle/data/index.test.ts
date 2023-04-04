import { expect, test } from "vitest";

import { guessType } from ".";

test("guessType", () => {
  expect(guessType("https://example.com/aaa/aaa.kml")).toBe("kml");
  expect(guessType("https://example.com/aaa/aaa.kmz")).toBe("kml");
  expect(guessType("https://example.com/aaa/aaa.czml")).toBe("czml");
  expect(guessType("https://example.com/aaa/aaa.gltf")).toBe("gltf");
  expect(guessType("https://example.com/aaa/aaa.glb")).toBe("gltf");
  expect(guessType("https://example.com/aaa/aaa.geojson")).toBe("geojson");
  expect(guessType("https://example.com/aaa/aaa.json")).toBe("geojson");
  expect(guessType("https://example.com/aaa/aaa.topojson")).toBe("geojson");
  expect(guessType("https://example.com/aaa/{z}/{x}/{y}.png")).toBe("tiles");
  expect(guessType("https://example.com/aaa/{z}/{x}/{y}.mvt")).toBe("mvt");
});
