import { Camera } from "@reearth/core";

export function areCamerasCloseEnoughCustomTolerance(
  camera1: Camera,
  camera2: Camera
): boolean {
  const tolerance = {
    lat: 0.0001,
    lng: 0.0001,
    height: 0.0001,
    heading: 0.0001,
    pitch: 0.0001,
    roll: 0.0001,
    fov: 0.1
  };

  return (
    isClose(camera1.lat, camera2.lat, tolerance.lat) &&
    isClose(camera1.lng, camera2.lng, tolerance.lng) &&
    isClose(camera1.height, camera2.height, tolerance.height) &&
    isClose(camera1.heading, camera2.heading, tolerance.heading) &&
    isClose(camera1.pitch, camera2.pitch, tolerance.pitch) &&
    isClose(camera1.roll, camera2.roll, tolerance.roll) &&
    isClose(camera1.fov, camera2.fov, tolerance.fov)
  );
}

export const isClose = (
  val1: number,
  val2: number,
  tolerance: number
): boolean => Math.abs(val1 - val2) < tolerance;
