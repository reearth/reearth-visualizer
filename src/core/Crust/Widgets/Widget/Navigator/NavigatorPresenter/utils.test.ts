import { test, expect } from "vitest";

import { calculateDegreeOfCompass } from "./utils";

const compassPosition = {
  x: 0,
  y: 0,
  height: 50,
  width: 50,
};

test("it should be 0˚ when x axis is half of width and y axis is 0", () => {
  expect(calculateDegreeOfCompass(compassPosition, { x: compassPosition.width / 2, y: 0 })).toBe(0);
});

test("it should be 90˚ when x axis equals to width and y axis half of height", () => {
  expect(
    calculateDegreeOfCompass(compassPosition, {
      x: compassPosition.width,
      y: compassPosition.height / 2,
    }),
  ).toBe(90);
});

test("it should be -90˚ when x axis is 0 and y axis half of height", () => {
  expect(
    calculateDegreeOfCompass(compassPosition, {
      x: 0,
      y: compassPosition.height / 2,
    }),
  ).toBe(270);
});
