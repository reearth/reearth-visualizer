import {
  CustomShader,
  CustomShaderMode,
  CustomShaderTranslucencyMode,
  LightingModel,
} from "cesium";

export const NonPBRLightingShader = new CustomShader({
  mode: CustomShaderMode.MODIFY_MATERIAL, // Need lighting
  lightingModel: LightingModel.PBR,
  translucencyMode: CustomShaderTranslucencyMode.OPAQUE,
  fragmentShaderText: /* glsl */ `
    void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
      material.diffuse = vec3(1.0);
      material.specular = vec3(0.0);
      material.emissive = vec3(0.0);
      material.alpha = 1.0;
    }
  `,
});
