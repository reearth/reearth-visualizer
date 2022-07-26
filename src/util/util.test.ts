import { expect, test } from "vitest";

import { partitionObject } from "./util";

test("partition object", () => {
  const actual = partitionObject({ a: 1, b: 2 }, ["a"]);
  expect(actual).toStrictEqual([{ a: 1 }, { b: 2 }]);
});
