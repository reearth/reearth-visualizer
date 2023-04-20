import { expect, test } from "vitest";

import arrayDiff from "./arrayDiff";

test("get diff correctly", () => {
  expect(arrayDiff(["a", "b", "c"], ["a", "b", "c"])).toEqual([]);

  expect(arrayDiff(["a", "b", "c"], ["b", "a", "c"])).toEqual([["b", 1, 0]]);

  expect(arrayDiff(["a", "b", "c"], ["a", "c"])).toEqual([["b", 1, -1]]);

  expect(arrayDiff(["a", "b", "c"], ["a", "d", "b", "c"])).toEqual([["d", -1, 1]]);

  expect(arrayDiff(["a", "b", "c", "f", "g"], ["b", "a", "d", "g", "e"])).toEqual([
    ["b", 1, 0],
    ["d", -1, 4],
    ["e", -1, 6],
    ["c", 2, -1],
    ["f", 3, -1],
  ]);
});
