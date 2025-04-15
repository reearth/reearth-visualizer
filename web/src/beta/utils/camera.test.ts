import { describe, it, expect } from "vitest";

import { areCamerasCloseEnoughCustomTolerance, isClose } from "./camera";

describe("isClose", () => {
  it("should return true when the difference is within the tolerance", () => {
    expect(isClose(10, 10.05, 0.1)).toBe(true);
    expect(isClose(5, 5.00009, 0.0001)).toBe(true);
  });

  it("should return false when the difference exceeds the tolerance", () => {
    expect(isClose(10, 10.2, 0.1)).toBe(false);
    expect(isClose(5, 5.0002, 0.0001)).toBe(false);
  });

  it("should return true when the values are exactly the same", () => {
    expect(isClose(10, 10, 0.1)).toBe(true);
    expect(isClose(0, 0, 0.0001)).toBe(true);
  });

  it("should handle negative values correctly", () => {
    expect(isClose(-10, -10.05, 0.1)).toBe(true);
    expect(isClose(-5, -5.2, 0.1)).toBe(false);
  });

  it("should return false when tolerance is zero and values are different", () => {
    expect(isClose(10, 10.01, 0)).toBe(false);
    expect(isClose(-5, -5.0001, 0)).toBe(false);
  });
});

describe("areCamerasCloseEnoughCustomTolerance", () => {
  const camera1 = {
    lat: 35.6895,
    lng: 139.6917,
    height: 100,
    heading: 0,
    pitch: -10,
    roll: 0,
    fov: 45
  };

  it("should return true when all properties are within tolerance", () => {
    const camera2 = {
      lat: 35.68951,
      lng: 139.69171,
      height: 100.00005,
      heading: 0.00005,
      pitch: -10.00005,
      roll: 0.00005,
      fov: 45.05
    };
    expect(areCamerasCloseEnoughCustomTolerance(camera1, camera2)).toBe(true);
  });

  it("should return false when any property exceeds tolerance", () => {
    const camera2 = {
      lat: 35.6896,
      lng: 139.6917,
      height: 100,
      heading: 0,
      pitch: -10,
      roll: 0,
      fov: 45.2
    };
    expect(areCamerasCloseEnoughCustomTolerance(camera1, camera2)).toBe(false);
  });
});
