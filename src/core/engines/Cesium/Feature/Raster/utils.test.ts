import { expect, test } from "vitest";

import { normalizeUrl } from "./utils";

test("normalizeUrl", () => {
  expect(normalizeUrl("https://aaaa", "png")).toBe("https://aaaa/{z}/{x}/{y}.png");
  expect(normalizeUrl("https://aaaa/bbbb/", "png")).toBe("https://aaaa/bbbb/{z}/{x}/{y}.png");
  expect(normalizeUrl("https://aaaa/bbbb/{z}/{x}/{y}.png", "png")).toBe(
    "https://aaaa/bbbb/{z}/{x}/{y}.png",
  );
  expect(normalizeUrl("https://aaaa/bbbb/%7Bz%7D/%7Bx%7D/%7By%7D.png", "png")).toBe(
    "https://aaaa/bbbb/{z}/{x}/{y}.png",
  );
});
