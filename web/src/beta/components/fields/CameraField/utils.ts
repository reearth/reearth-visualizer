import { Camera } from "./types";

export const degreesToRadians = (degrees: number): number => degrees * (Math.PI / 180);

export const radiansToDegrees = (radians: number): number => radians * (180 / Math.PI);

export const userFriendlyCamera = (camera: Camera) => ({
  lat: camera.lat,
  lng: camera.lng,
  height: camera.height,
  heading: radiansToDegrees(camera.heading),
  pitch: radiansToDegrees(camera.pitch),
  roll: radiansToDegrees(camera.roll),
  fov: camera?.fov,
});

export const saveFriendlyCamera = (camera: Camera) => ({
  lat: camera.lat,
  lng: camera.lng,
  height: camera.height,
  heading: degreesToRadians(camera.heading),
  pitch: degreesToRadians(camera.pitch),
  roll: degreesToRadians(camera.roll),
  fov: camera?.fov,
});
