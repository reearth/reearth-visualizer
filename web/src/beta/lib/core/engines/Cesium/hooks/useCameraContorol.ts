import {
  Cartesian3,
  Math as CesiumMath,
  Matrix4,
  PerspectiveFrustum,
  ScreenSpaceEventType,
  Transforms,
  type Scene,
} from "cesium";
import { useCallback, useRef } from "react";
import { useCesium } from "resium";
import invariant from "tiny-invariant";

import { useConstant } from "@reearth/beta/utils/util";

import { adjustHeightForTerrain } from "../common";

import { usePreUpdate } from "./useSceneEvent";
import { useScreenSpaceEvent, useScreenSpaceEventHandler } from "./useScreenSpaceEvent";

function timeStampsToSign(positive?: number, negative?: number): number {
  return positive != null
    ? negative != null
      ? positive > negative
        ? 1
        : -1
      : 1
    : negative != null
    ? -1
    : 0;
}

export interface KeyboardHandlersProps {
  minimumZoomDistance?: number;
  acceleration?: number;
  damping?: number;
  maximumSpeed?: number;
}

const matrixScratch = new Matrix4();
const forwardScratch = new Cartesian3();
const rightScratch = new Cartesian3();
const upScratch = new Cartesian3();

const minimumZoomDistance = 1.5;
const acceleration = 0.1;
const damping = 0.3;
const maximumSpeed = 3;

export const useCameraControl = (directionsRef: any, modesRef: any) => {
  const enabled = useRef(false);
  const { viewer } = useCesium();
  const scene = viewer?.scene;
  const camera = viewer?.scene.camera;

  const enableCameraControl = useCallback(() => {
    enabled.current = true;
  }, []);

  const state = useConstant(() => ({
    time: Date.now(),
    direction: new Cartesian3(),
    speed: 0,
  }));

  const handler = useScreenSpaceEventHandler();
  useScreenSpaceEvent(handler, ScreenSpaceEventType.WHEEL, value => {
    const frustum = camera?.frustum;
    invariant(frustum instanceof PerspectiveFrustum);
    frustum.fov = CesiumMath.clamp(frustum.fov - value / 5000, Math.PI * 0.1, Math.PI * 0.75);
  });

  usePreUpdate(() => {
    const time = Date.now();
    const deltaSeconds = (time - state.time) / 1000;
    state.time = time;

    const directions = directionsRef.current;
    const flags = modesRef.current;
    const forwardSign = timeStampsToSign(directions.forward, directions.backward);
    const rightSign = timeStampsToSign(directions.right, directions.left);
    const upSign = timeStampsToSign(directions.up, directions.down);
    if (!camera || !scene) return;
    if (forwardSign !== 0 || rightSign !== 0 || upSign !== 0) {
      const matrix = Transforms.eastNorthUpToFixedFrame(
        camera.position,
        scene?.globe.ellipsoid,
        matrixScratch,
      );
      const up = Cartesian3.fromElements(matrix[8], matrix[9], matrix[10], upScratch);
      const forward = Cartesian3.multiplyByScalar(
        up,
        Cartesian3.dot(camera?.direction, up),
        forwardScratch,
      );
      Cartesian3.subtract(camera.direction, forward, forward);
      Cartesian3.normalize(forward, forward);
      const right = Cartesian3.multiplyByScalar(up, Cartesian3.dot(camera.right, up), rightScratch);
      Cartesian3.subtract(camera.right, right, right);
      Cartesian3.normalize(right, right);

      Cartesian3.multiplyByScalar(right, rightSign, right);
      Cartesian3.multiplyByScalar(up, upSign, up);
      Cartesian3.add(
        Cartesian3.multiplyByScalar(forward, forwardSign, forward),
        right,
        state.direction,
      );
      Cartesian3.add(state.direction, up, state.direction);
      Cartesian3.normalize(state.direction, state.direction);
      if (flags.sprint === true) {
        state.speed = Math.min(maximumSpeed * 2, state.speed + acceleration);
      } else if (state.speed > 1) {
        state.speed = Math.max(maximumSpeed, state.speed - damping);
      } else {
        state.speed = Math.min(maximumSpeed, state.speed + acceleration);
      }
    } else {
      state.speed = Math.max(0, state.speed - damping);
    }

    if (state.speed > 0.01) {
      let speed = state.speed;
      const { globeHeight } = scene as Scene & { globeHeight?: number };
      if (globeHeight != null) {
        const cameraHeight = scene?.camera.positionCartographic.height;
        speed *= 1 + Math.max(0, cameraHeight - globeHeight) * 0.1;
      }
      camera.move(state.direction, speed * deltaSeconds);
      adjustHeightForTerrain(scene, minimumZoomDistance);
    }
  });
  return enableCameraControl;
};
