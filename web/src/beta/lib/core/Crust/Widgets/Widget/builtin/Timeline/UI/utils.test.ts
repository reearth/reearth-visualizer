import { expect, test } from "vitest";

import { calcScaleInterval } from "./utils";

test("calcScaleInterval()", () => {
  expect(
    calcScaleInterval(new Date("2023-01-02").getTime() - new Date("2023-01-01").getTime(), 1, {
      gap: 10,
      width: 300,
    }),
  ).toEqual({
    gap: 10.358333333333333,
    scaleCount: 24,
    scaleInterval: 3600,
    strongScaleMinutes: 10,
  });
  expect(
    calcScaleInterval(new Date("2023-01-02").getTime() - new Date("2023-01-01").getTime(), 2, {
      gap: 10,
      width: 300,
    }),
  ).toEqual({
    gap: 10,
    scaleCount: 48,
    scaleInterval: 1800,
    strongScaleMinutes: 15,
  });
});
