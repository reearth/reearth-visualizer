import { expect, test } from "vitest";

import deepGet from "./deepGet";

test("find an element", () => {
  const cases: [number[], string | string[] | undefined][] = [
    [[], undefined],
    [[0], "a"],
    [[1], ["b", "c"]],
    [[1, 1], "c"],
    [[1, 3], undefined],
    [[100], undefined],
  ];

  cases.forEach(([index, expected]) => {
    expect(
      deepGet<string | string[]>(["a", ["b", "c"], "d"], index, e => (Array.isArray(e) ? e : [])),
    ).toEqual(expected);
  });
});
