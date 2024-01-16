import { Cartesian3, Ray, type Cartesian2, type Scene } from "@cesium/engine";

const rayScratch = new Ray();

export function pickGround(
  scene: Scene,
  position: Cartesian2,
  result?: Cartesian3,
): Cartesian3 | undefined {
  const ray = scene.camera.getPickRay(position, rayScratch);
  if (ray == null) {
    return;
  }
  return scene.globe.pick(ray, scene, result ?? new Cartesian3());
}
