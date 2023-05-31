import { expect, test } from "vitest";

import { ariaProps } from "./aria";

test("get aria props", () => {
  expect(ariaProps(1)).toEqual({});
  expect(
    ariaProps({
      a: 1,
      "aria-hidden": "true",
      ariaExpanded: false,
      "aria-hoge": "false",
    }),
  ).toEqual({
    "aria-hidden": "true",
    "aria-expanded": false,
  });
});
