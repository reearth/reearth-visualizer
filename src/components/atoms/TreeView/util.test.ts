import { expect, test } from "vitest";

import { Item } from "./types";
import { isAncestor, searchItems } from "./util";

const items: Item<null>[] = [
  { id: "x", content: null },
  {
    id: "y",
    children: [
      { id: "a", content: null },
      { id: "b", content: null },
      {
        id: "c",
        children: [
          { id: "g", content: null },
          { id: "h", content: null },
          { id: "i", content: null },
        ],
        content: null,
      },
      { id: "d", content: null },
      { id: "e", content: null },
      { id: "f", content: null },
    ],
    content: null,
  },
  { id: "z", content: null },
];

test("searchItems search items correctly", () => {
  expect(searchItems(items, [])).toEqual([]);
  expect(searchItems(items, ["x"])).toEqual([[{ id: "x", content: null }, [0]]]);
  expect(searchItems(items, ["z", "e"])).toEqual([
    [{ id: "z", content: null }, [2]],
    [{ id: "e", content: null }, [1, 4]],
  ]);
  expect(searchItems(items, ["i"])).toEqual([[{ id: "i", content: null }, [1, 2, 2]]]);
  expect(searchItems(items, ["a", "xxxxx", "b"])).toEqual([
    [{ id: "a", content: null }, [1, 0]],
    [undefined, []],
    [{ id: "b", content: null }, [1, 1]],
  ]);
});

test("isAncestor detect ancestor correctly", () => {
  expect(isAncestor([1, 2, 3], [0])).toEqual(false);
  expect(isAncestor([1, 2, 3], [1])).toEqual(true);
  expect(isAncestor([1, 2, 3], [1, 3])).toEqual(false);
  expect(isAncestor([1, 2, 3], [1, 2])).toEqual(true);
  expect(isAncestor([1, 2, 3], [1, 2, 4])).toEqual(false);
  expect(isAncestor([1, 2, 3], [1, 2, 3])).toEqual(true);
  expect(isAncestor([1, 2, 3], [1, 2, 3, 4])).toEqual(false);
});
