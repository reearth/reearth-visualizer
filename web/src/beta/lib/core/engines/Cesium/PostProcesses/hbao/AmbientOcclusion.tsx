import { PerspectiveFrustum, type Scene } from "@cesium/engine";
import { useState, type FC } from "react";
import { useCesium } from "resium";
import invariant from "tiny-invariant";

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
    invariant(frustum instanceof PerspectiveFrustum);
    const cotFovy = 1 / Math.tan(frustum.fovy / 2);
    stage.uniforms.focalLength.x = cotFovy * frustum.aspectRatio;
    stage.uniforms.focalLength.y = cotFovy;
  });

  return null;
};

export const AmbientOcclusion: FC<AmbientOcclusionProps> = props => {
  const viewer = useCesium();
  const [useGlobeDepth, setUseGlobeDepth] = useState(false);
  usePreRender(() => {
    setUseGlobeDepth(!viewer.scene?.globe.depthTestAgainstTerrain);
  });
  return <AmbientOcclusionStage {...props} useGlobeDepth={useGlobeDepth} />;
};
