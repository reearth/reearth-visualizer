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
      vec4 baseColorWithAlpha = vec4(1.0);

      // Use texture
      // ref: https://github.com/CesiumGS/cesium/blob/50468896ca7d6071e0f8fb359598c03879fbf0a2/packages/engine/Source/Shaders/Model/MaterialStageFS.glsl#L71-L85
      #ifdef HAS_BASE_COLOR_TEXTURE 
        vec2 baseColorTexCoords = TEXCOORD_BASE_COLOR;

        #ifdef HAS_BASE_COLOR_TEXTURE_TRANSFORM
          baseColorTexCoords = computeTextureTransform(baseColorTexCoords, u_baseColorTextureTransform);
        #endif

        baseColorWithAlpha = czm_srgbToLinear(texture(u_baseColorTexture, baseColorTexCoords));

        #ifdef HAS_BASE_COLOR_FACTOR
          baseColorWithAlpha *= u_baseColorFactor;
        #endif
      #endif

      // Use attribute's color
      // ref: https://github.com/CesiumGS/cesium/blob/50468896ca7d6071e0f8fb359598c03879fbf0a2/packages/engine/Source/Shaders/Model/MaterialStageFS.glsl#L89
      #ifdef HAS_POINT_CLOUD_COLOR_STYLE
      baseColorWithAlpha = v_pointCloudColor;
      #elif defined(HAS_COLOR_0)
      vec4 color = fsInput.attributes.color_0;
          // .pnts files store colors in the sRGB color space
          #ifdef HAS_SRGB_COLOR
          color = czm_srgbToLinear(color);
          #endif
      baseColorWithAlpha *= color;
      #endif

      material.diffuse = baseColorWithAlpha.rgb;

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
