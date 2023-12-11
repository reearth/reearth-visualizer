import { Cartesian3 } from "cesium";
import { expect, test } from "vitest";

import { arrayToCartecian3 } from "./sphericalHaromic";

test("arrayToCartecian3", () => {
  expect(
    arrayToCartecian3(
      [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
      ],
      2,
    ),
  ).toEqual([
    new Cartesian3(2, 2, 2),
    new Cartesian3(2, 2, 2),
    new Cartesian3(2, 2, 2),
    new Cartesian3(2, 2, 2),
    new Cartesian3(2, 2, 2),
    new Cartesian3(2, 2, 2),
    new Cartesian3(2, 2, 2),
    new Cartesian3(2, 2, 2),
    new Cartesian3(2, 2, 2),
  ]);
});
