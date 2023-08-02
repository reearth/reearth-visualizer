import {
  Cartesian3,
  CustomShader,
  CustomShaderMode,
  CustomShaderTranslucencyMode,
  LightingModel,
  UniformType,
} from "cesium";

type PBROption = {
  color?: number[];
  roughness?: number;
  metalness?: number;
};

export class CustomPBRShader extends CustomShader {
  constructor(options: PBROption = {}) {
    super({
      mode: CustomShaderMode.MODIFY_MATERIAL, // Need lighting
      lightingModel: LightingModel.PBR,
      uniforms: {
        u_color: {
          type: UniformType.VEC3,
          value: options.color
            ? new Cartesian3(options.color[0], options.color[1], options.color[2])
            : new Cartesian3(1, 1, 1),
        },
        u_roughness: {
          type: UniformType.FLOAT,
          value: options.roughness ?? 0,
        },
        u_metalness: {
          type: UniformType.FLOAT,
          value: options.metalness ?? 0,
        },
      },
      translucencyMode: CustomShaderTranslucencyMode.OPAQUE,
      fragmentShaderText: /* glsl */ `
        void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
          czm_pbrParameters parameters = czm_pbrMetallicRoughnessMaterial(u_color, u_metalness, u_roughness);
          material.diffuse = parameters.diffuseColor;
          material.specular = vec3(0.0);
          material.emissive = vec3(0.0);
          material.alpha = 1.0;
        }
      `,
    });
  }
}
