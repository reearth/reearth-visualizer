import { Camera, Cartesian2, PerspectiveFrustum } from "cesium";
import invariant from "tiny-invariant";

const cartesianScratch = new Cartesian2();

export function getFieldOfView(camera: Camera, zoom: number): number {
  const fov = getFieldOfViewSeparate(camera, zoom, cartesianScratch);
  const frustum = camera.frustum;
  invariant(frustum instanceof PerspectiveFrustum);
  return frustum.aspectRatio > 1 ? fov.x : fov.y;
}

export function getFieldOfViewSeparate(
  camera: Camera,
  zoom: number,
  result = new Cartesian2(),
): Cartesian2 {
  const frustum = camera.frustum;
  invariant(frustum instanceof PerspectiveFrustum);
  result.x = Math.atan(Math.pow(2, 1 - zoom)) * 2;
  result.y = 2 * Math.atan(frustum.aspectRatio * Math.tan(result.x / 2));
  return result;
}
