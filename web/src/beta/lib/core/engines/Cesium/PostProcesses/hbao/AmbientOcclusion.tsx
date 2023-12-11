import { PerspectiveFrustum, type Scene, Math as CesiumMath } from "cesium";
import { useState, type FC } from "react";
import { useCesium } from "resium";

import { useInstance } from "../../hooks/useInstance";
import { usePreRender } from "../../hooks/useSceneEvent";

import {
  createAmbientOcclusionStage,
  type AmbientOcclusionStageOptions,
  type AmbientOcclusionStageUniforms,
} from "./createAmbientOcclusionStage";

export interface AmbientOcclusionProps
  extends Omit<AmbientOcclusionStageOptions, "prefix">,
    Partial<AmbientOcclusionStageUniforms> {
  enabled?: boolean;
}

export const AmbientOcclusionStage = ({
  enabled = true,
  textureScale,
  directions,
  steps,
  denoise,
  accurateNormalReconstruction,
  outputType,
  useGlobeDepth,
  ...uniforms
}: AmbientOcclusionProps) => {
  const { viewer } = useCesium();
  const scene = viewer?.scene;
  const stage = useInstance({
    owner: scene?.postProcessStages,
    keys: [
      textureScale,
      steps,
      directions,
      denoise,
      accurateNormalReconstruction,
      outputType,
      useGlobeDepth,
    ],
    create: () => {
      const stage = createAmbientOcclusionStage({
        textureScale,
        steps,
        directions,
        denoise,
        accurateNormalReconstruction,
        outputType,
        useGlobeDepth,
        // It's tricky to bind globe's depth texture to postprocess stage,
        // because it is undefined for the first several frames, or when
        // terrain is being reconstructed. Functional uniform value is invoked
        // when this stage is actually being rendered.
        getGlobeDepthTexture: () =>
          (
            scene as Scene & {
              context: {
                uniformState: {
                  globeDepthTexture?: unknown;
                };
              };
            }
          ).context.uniformState.globeDepthTexture,
        uniforms,
      });
      stage.enabled = enabled;
      return stage;
    },
    transferOwnership: (stage, postProcessStages) => {
      postProcessStages?.add(stage);
      return () => {
        postProcessStages?.remove(stage);
      };
    },
  });

  stage.enabled = enabled;
  Object.assign(stage.uniforms, uniforms);
  scene?.requestRender();

  usePreRender(() => {
    const frustum = scene?.camera.frustum;
    if (frustum instanceof PerspectiveFrustum) {
      const cotFovy = 1 / Math.tan(frustum.fovy / 2);
      stage.uniforms.focalLength.x = cotFovy * frustum.aspectRatio;
      stage.uniforms.focalLength.y = cotFovy;
    }
  });

  return null;
};

export const AmbientOcclusion: FC<AmbientOcclusionProps> = props => {
  const viewer = useCesium();
  const [useGlobeDepth, setUseGlobeDepth] = useState(false);
  usePreRender(() => {
    const scene = viewer.scene;

    setUseGlobeDepth(!scene?.globe.depthTestAgainstTerrain);

    // ref: https://github.com/takram-design-engineering/plateau-view/blob/6669bea902c5e53c21b695d32ada5ca3121bc401/libs/view/src/containers/SceneCoordinator.tsx#L27-L41
    // Increase the precision of the depth buffer which HBAO looks up to
    // reconstruct normals.
    const { globeHeight } = scene as Scene & { globeHeight?: number };
    if (!scene || globeHeight == null) {
      return;
    }
    // Screen-space camera controller should detect collision
    const cameraHeight = scene.camera.positionCartographic.height - globeHeight;
    const frustum = scene?.camera.frustum;
    if (frustum instanceof PerspectiveFrustum) {
      scene.camera.frustum.near =
        CesiumMath.clamp(cameraHeight - 1, 1, 5) / Math.tan(frustum.fov / 2);
    }
  });
  return <AmbientOcclusionStage {...props} useGlobeDepth={useGlobeDepth} />;
};
