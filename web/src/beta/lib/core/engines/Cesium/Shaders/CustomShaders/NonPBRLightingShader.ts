import {
  CustomShader,
  CustomShaderMode,
  CustomShaderTranslucencyMode,
  LightingModel,
} from "cesium";

export const NonPBRWithTextureLightingShader = new CustomShader({
  mode: CustomShaderMode.MODIFY_MATERIAL, // Need lighting
  lightingModel: LightingModel.PBR,
  translucencyMode: CustomShaderTranslucencyMode.OPAQUE,
  fragmentShaderText: /* glsl */ `
    void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
      // Disable PBR for the material which has texture
      // ref: https://github.com/CesiumGS/cesium/blob/50468896ca7d6071e0f8fb359598c03879fbf0a2/packages/engine/Source/Shaders/Model/MaterialStageFS.glsl#L71-L85
      #ifdef HAS_BASE_COLOR_TEXTURE 
        vec4 baseColorWithAlpha = vec4(1.0);
        vec2 baseColorTexCoords = TEXCOORD_BASE_COLOR;

        #ifdef HAS_BASE_COLOR_TEXTURE_TRANSFORM
          baseColorTexCoords = computeTextureTransform(baseColorTexCoords, u_baseColorTextureTransform);
        #endif

        baseColorWithAlpha = czm_srgbToLinear(texture(u_baseColorTexture, baseColorTexCoords));

        #ifdef HAS_BASE_COLOR_FACTOR
          baseColorWithAlpha *= u_baseColorFactor;
        #endif

        material.diffuse = baseColorWithAlpha.rgb;
      #else
        material.diffuse = vec3(1.);
      #endif
      material.specular = vec3(0.0);
      material.emissive = vec3(0.0);
      material.alpha = 1.0;
    }
  `,
});

export const NonPBRLightingShader = new CustomShader({
  mode: CustomShaderMode.MODIFY_MATERIAL, // Need lighting
  lightingModel: LightingModel.PBR,
  translucencyMode: CustomShaderTranslucencyMode.OPAQUE,
  fragmentShaderText: /* glsl */ `
    void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
      material.diffuse = vec3(1.);
      material.specular = vec3(0.0);
      material.emissive = vec3(0.0);
      material.alpha = 1.0;
    }
  `,
});
