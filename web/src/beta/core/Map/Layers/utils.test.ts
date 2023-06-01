import { expect, test } from "vitest";

import { deepAssign } from "./utils";

test("deepAssign", () => {
  expect(
    deepAssign(
      { marker: { color: "red", size: 100 } },
      { marker: { color: "blue", image: "example.com" } },
    ),
  ).toEqual({ marker: { color: "blue", size: 100, image: "example.com" } });

  expect(
    deepAssign({ marker: { color: "red", size: 100 } }, { marker: { color: undefined } }),
  ).toEqual({ marker: { size: 100 } });

  expect(deepAssign({ marker: { color: "red", size: 100 } }, { marker: undefined })).toEqual({});

  expect(
    deepAssign(
      { marker: { color: "red", size: 100 }, test: { value: ["abc"] } },
      { marker: undefined },
    ),
  ).toEqual({
    test: { value: ["abc"] },
  });

  expect(
    deepAssign(
      {
        marker: { color: "red", size: 100, deep: { value: { a: "abc" } } },
        test: { value: ["abc"] },
      },
      { marker: { deep: { value: { b: "def" } } } },
    ),
  ).toEqual({
    marker: { color: "red", size: 100, deep: { value: { a: "abc", b: "def" } } },
    test: { value: ["abc"] },
  });

  expect(
    deepAssign(
      {
        marker: { color: "red", size: 100, deep: { value: { a: "abc" } } },
        test: { value: ["abc"] },
      },
      { marker: {} },
    ),
  ).toEqual({
    marker: {},
    test: { value: ["abc"] },
  });
});
