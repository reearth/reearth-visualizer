import { expect, test } from "vitest";

import { parseHost, DataSource } from "./path";

test("parse host", () => {
  const cases = [
    {
      source: "hoge://aaa/bbb",
      expected: "aaa",
    },
    {
      source: "random string",
      expected: undefined,
    },
  ];

  cases.forEach(c => {
    expect(parseHost(c.source as DataSource)).toBe(c.expected);
  });
});
