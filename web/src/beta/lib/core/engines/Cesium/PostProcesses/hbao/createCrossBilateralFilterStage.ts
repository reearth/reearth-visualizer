import { PostProcessStage, PostProcessStageComposite, PostProcessStageSampleMode } from "cesium";
import { defaults } from "lodash-es";

import { createUniforms } from "../../helpers/createUniforms";

import { type AmbientOcclusionOutputType } from "./AmbientOcclusionOutputType";
import crossBilateralFilter from "./shaders/crossBilateralFilter.glsl?raw";
import depth from "./shaders/depth.glsl?raw";
import globeDepth from "./shaders/globeDepth.glsl?raw";
import packing from "./shaders/packing.glsl?raw";
import reconstructPosition from "./shaders/reconstructPosition.glsl?raw";

interface PrivatePostProcessStage extends PostProcessStage {
  _depthTexture: unknown;
}

export interface CrossBilateralFilterStageUniforms {
  textureScale: number;
  frustumLength: number;
  normalExponent: number;
  depthExponent: number;
}

const defaultUniforms: CrossBilateralFilterStageUniforms = {
  textureScale: 1,
  frustumLength: 1e5,
  normalExponent: 5,
  depthExponent: 1,
};

export interface CrossBilateralFilterStageOptions {
  prefix?: string;
  outputType?: AmbientOcclusionOutputType | null;
  useGlobeDepth?: boolean;
  getGlobeDepthTexture?: () => unknown | undefined;
  uniforms?: Partial<CrossBilateralFilterStageUniforms>;
}

export function createBilateralFilterStage({
  prefix = "reearth",
  outputType = null,
  useGlobeDepth = false,
  getGlobeDepthTexture,
  uniforms: uniformsOption,
}: CrossBilateralFilterStageOptions): PostProcessStageComposite {
  const uniforms = defaults({}, uniformsOption, defaultUniforms);

  const blurX = new PostProcessStage({
    name: `${prefix}_ambient_occlusion_cross_bilateral_filter_x`,
    fragmentShader: `
      #define DIRECTION (0)
      ${outputType != null ? `#define OUTPUT_TYPE (${outputType})` : ""}
      ${useGlobeDepth ? globeDepth : depth}
      ${packing}
      ${reconstructPosition}
      ${crossBilateralFilter}
    `,
    uniforms: {
      ...uniforms,
      globeDepthTexture: () =>
        getGlobeDepthTexture?.() ?? (blurX as PrivatePostProcessStage)._depthTexture,
    },
    sampleMode: PostProcessStageSampleMode.LINEAR,
  });

  const blurY = new PostProcessStage({
    name: `${prefix}_ambient_occlusion_cross_bilateral_filter_y`,
    fragmentShader: `
      #define DIRECTION (1)
      ${outputType != null ? `#define OUTPUT_TYPE (${outputType})` : ""}
      ${useGlobeDepth ? globeDepth : depth}
      ${packing}
      ${reconstructPosition}
      ${crossBilateralFilter}
    `,
    uniforms: {
      ...uniforms,
      globeDepthTexture: () =>
        getGlobeDepthTexture?.() ?? (blurY as PrivatePostProcessStage)._depthTexture,
    },
    sampleMode: PostProcessStageSampleMode.LINEAR,
  });

  return new PostProcessStageComposite({
    name: `${prefix}_ambient_occlusion_cross_bilateral_filter`,
    stages: [blurX, blurY],
    uniforms: createUniforms<CrossBilateralFilterStageUniforms>([
      {
        stages: [blurX, blurY],
        uniforms: ["textureScale", "frustumLength", "normalExponent", "depthExponent"],
      },
    ]),
  });
}
