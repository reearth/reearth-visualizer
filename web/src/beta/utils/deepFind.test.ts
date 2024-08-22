import { expect, test } from "vitest";

import deepFind from "./deepFind";

test("find an element", () => {
  expect(
    deepFind<string | string[]>(
      ["a", ["b", "c"], "d"],
      e => e === "c",
      e => (Array.isArray(e) ? e : []),
    ),
  ).toEqual(["c", [1, 1]]);

  expect(
    deepFind<string | string[]>(
      ["a", ["b", "c"], "d"],
      e => e === "e",
      e => (Array.isArray(e) ? e : []),
    ),
  ).toEqual([undefined, []]);

  expect(
    deepFind<string | string[]>(
      ["a", ["b", "c"], "d"],
      e => e === "a",
      e => (Array.isArray(e) ? e : []),
    ),
  ).toEqual(["a", [0]]);
});
