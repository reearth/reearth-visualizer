// This file refers this implementation:
// https://github.com/takram-design-engineering/plateau-view/blob/8ea8bf1d5ef64319d92d0eb05b936cca7f1a2e8f/libs/cesium/src/shaders/imageBasedLightingStage.glsl

// Derived from:
// https://github.com/CesiumGS/cesium/blob/1.106/packages/engine/Source/Shaders/Model/ImageBasedLightingStageFS.glsl
// Specular term was removed, as I never apply it on terrain.
vec3 reearth_imageBasedLightingStage(vec3 positionEC, vec3 normalEC,
                                     vec3 lightDirectionEC, vec3 lightColorHdr,
                                     czm_pbrParameters pbrParameters) {
  vec3 v = -positionEC;
  vec3 n = normalEC;
  vec3 l = normalize(lightDirectionEC);
  vec3 h = normalize(v + l);
  float NdotV = abs(dot(n, v)) + 0.001;
  float VdotH = clamp(dot(v, h), 0.0, 1.0);

  const mat3 yUpToZUp = mat3(-1.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0, 1.0, 0.0);
  // Reference frame matrix can be computed only by world position and normal.
  mat3 referenceFrameMatrix =
      czm_transpose(czm_eastNorthUpToEyeCoordinates(v_positionMC, normalEC));
  vec3 cubeDir =
      normalize(yUpToZUp * referenceFrameMatrix * normalize(reflect(-v, n)));
  vec3 diffuseIrradiance =
      czm_sphericalHarmonics(cubeDir, u_reearth_sphericalHarmonicCoefficients);

  return pbrParameters.diffuseColor * diffuseIrradiance;
}

vec4 reearth_computeImageBasedLightingColor(vec4 color) {
  if (u_reearth_globeImageBasedLighting) {
    czm_pbrParameters pbrParameters;
    pbrParameters.diffuseColor = color.rgb;

    vec3 normalEC = normalize(v_normalEC);
    vec3 lighting =
        czm_pbrLighting(v_positionEC, normalEC, czm_lightDirectionEC,
                        czm_lightColorHdr, pbrParameters);
    lighting += reearth_imageBasedLightingStage(
                    v_positionEC, normalEC, czm_lightDirectionEC,
                    czm_lightColorHdr, pbrParameters) *
                u_vertexShadowDarkness;

#ifndef HDR
    lighting = czm_acesTonemapping(lighting);
    lighting = czm_linearToSrgb(lighting);
#endif

    return vec4(color.rgb * lighting, color.a);
  } else {
    float diffuseIntensity = clamp(
        czm_getLambertDiffuse(czm_lightDirectionEC, normalize(v_normalEC)) *
                u_lambertDiffuseMultiplier +
            u_vertexShadowDarkness,
        0.0, 1.0);
    return vec4(color.rgb * czm_lightColor * diffuseIntensity, color.a);
  }
}
