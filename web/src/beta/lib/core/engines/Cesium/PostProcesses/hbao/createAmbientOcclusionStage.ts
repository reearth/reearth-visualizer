import { Cartesian2, Color, PostProcessStage, PostProcessStageComposite } from "cesium";
import { defaults, pick } from "lodash-es";

import { createUniforms } from "../../helpers/createUniforms";

import { type AmbientOcclusionOutputType } from "./AmbientOcclusionOutputType";
import { createBilateralFilterStage } from "./createCrossBilateralFilterStage";
import ambientOcclusionGenerate from "./shaders/ambientOcclusionGenerate.glsl?raw";
import ambientOcclusionModulate from "./shaders/ambientOcclusionModulate.glsl?raw";
import depth from "./shaders/depth.glsl?raw";
import globeDepth from "./shaders/globeDepth.glsl?raw";
import highPassRandom from "./shaders/highPassRandom.glsl?raw";
import packing from "./shaders/packing.glsl?raw";
import reconstructNormal from "./shaders/reconstructNormal.glsl?raw";
import reconstructPosition from "./shaders/reconstructPosition.glsl?raw";
import turboColorMap from "./shaders/turboColorMap.glsl?raw";

interface PrivatePostProcessStage extends PostProcessStage {
  _depthTexture: unknown;
}

export interface AmbientOcclusionStageUniforms {
  intensity: number;
  color: Color;
  maxRadius: number;
  frustumLength: number;
  bias: number;
  focalLength: Cartesian2;
  blackPoint: number;
  whitePoint: number;
  gamma: number;
  normalExponent?: number;
  depthExponent?: number;
}

const defaultUniforms: Omit<AmbientOcclusionStageUniforms, "globeDepthTexture"> = {
  intensity: 100,
  color: Color.BLACK,
  maxRadius: 30,
  bias: 0.1,
  frustumLength: 1e5,
  focalLength: new Cartesian2(),
  blackPoint: 0.05,
  whitePoint: 0.9,
  gamma: 2.5,
};

export interface AmbientOcclusionStageOptions {
  prefix?: string;
  textureScale?: number;
  directions?: number;
  steps?: number;
  denoise?: boolean;
  accurateNormalReconstruction?: boolean;
  outputType?: AmbientOcclusionOutputType | null;
  useGlobeDepth?: boolean;
  getGlobeDepthTexture?: () => unknown | undefined;
  uniforms?: Partial<AmbientOcclusionStageUniforms>;
}

export function createAmbientOcclusionStage({
  prefix = "reearth",
  textureScale = 1,
  directions,
  steps,
  denoise = true,
  accurateNormalReconstruction = true,
  outputType = null,
  useGlobeDepth = false,
  getGlobeDepthTexture,
  uniforms: uniformsOption = {},
}: AmbientOcclusionStageOptions): PostProcessStageComposite {
  const uniforms = defaults({}, uniformsOption, defaultUniforms);

  const generate = new PostProcessStage({
    name: `${prefix}_ambient_occlusion_generate`,
    fragmentShader: `
      ${directions != null ? `#define NUM_DIRECTIONS (${directions})` : ""}
      ${steps != null ? `#define NUM_STEPS (${steps})` : ""}
      ${accurateNormalReconstruction ? "#define USE_ACCURATE_NORMAL" : ""}
      ${outputType != null ? `#define OUTPUT_TYPE (${outputType})` : ""}
      ${useGlobeDepth ? globeDepth : depth}
      ${packing}
      ${highPassRandom}
      ${reconstructPosition}
      ${reconstructNormal}
      ${ambientOcclusionGenerate}
    `,
    textureScale,
    uniforms: {
      textureScale,
      ...pick(uniforms, ["intensity", "maxRadius", "bias", "frustumLength", "focalLength"]),
      globeDepthTexture: () => {
        return getGlobeDepthTexture?.() ?? (generate as PrivatePostProcessStage)._depthTexture;
      },
    },
  });

  const modulate = new PostProcessStage({
    name: `${prefix}_ambient_occlusion_modulate`,
    fragmentShader: `
      ${outputType != null ? `#define OUTPUT_TYPE (${outputType})` : ""}
      ${useGlobeDepth ? globeDepth : depth}
      ${packing}
      ${reconstructPosition}
      ${turboColorMap}
      ${ambientOcclusionModulate}
    `,
    uniforms: {
      ...pick(uniforms, ["color", "frustumLength", "blackPoint", "whitePoint", "gamma"]),
      globeDepthTexture: () =>
        getGlobeDepthTexture?.() ?? (modulate as PrivatePostProcessStage)._depthTexture,
    },
  });

  if (denoise) {
    const filter = createBilateralFilterStage({
      prefix,
      outputType,
      useGlobeDepth,
      getGlobeDepthTexture,
      uniforms: {
        textureScale,
        ...pick(uniforms, ["frustumLength", "normalExponent", "depthExponent"]),
      },
    });

    const generateAndFilter = new PostProcessStageComposite({
      name: `${prefix}_ambient_occlusion_generate_and_filter`,
      stages: [generate, filter],
    });

    modulate.uniforms.ambientOcclusionTexture = generateAndFilter.name;

    return new PostProcessStageComposite({
      name: `${prefix}_ambient_occlusion`,
      stages: [generateAndFilter, modulate],
      inputPreviousStageTexture: false,
      uniforms: createUniforms<AmbientOcclusionStageUniforms>([
        {
          stage: generate,
          uniforms: ["intensity", "maxRadius", "bias", "frustumLength", "focalLength"],
        },
        {
          stage: filter,
          uniforms: ["frustumLength", "normalExponent", "depthExponent"],
        },
        {
          stage: modulate,
          uniforms: ["color", "blackPoint", "whitePoint", "gamma"],
        },
      ]),
    });
  } else {
    modulate.uniforms.ambientOcclusionTexture = generate.name;

    return new PostProcessStageComposite({
      name: `${prefix}_ambient_occlusion`,
      stages: [generate, modulate],
      inputPreviousStageTexture: false,
      uniforms: createUniforms<AmbientOcclusionStageUniforms>([
        {
          stage: generate,
          uniforms: ["intensity", "maxRadius", "bias", "frustumLength", "focalLength"],
        },
        {
          stage: modulate,
          uniforms: ["color", "blackPoint", "whitePoint", "gamma"],
        },
      ]),
    });
  }
}
