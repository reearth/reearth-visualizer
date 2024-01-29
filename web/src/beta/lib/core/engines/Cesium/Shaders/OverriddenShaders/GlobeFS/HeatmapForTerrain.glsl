vec3 reearth_calculateElevationMapForGlobe(vec4 colorToAlpha, vec3 color) {
  if(greaterThan(colorToAlpha, vec4(0.9)) == bvec4(true)) {
    float decodedValue = dot(color, vec3(16711680.0, 65280.0, 255.0));
    float height = (decodedValue - 8388607.0) * 0.01;
    float minHeight = czm_branchFreeTernary(logarithmic_3, pseudoLog(minHeight_1), minHeight_1);
    float maxHeight = czm_branchFreeTernary(logarithmic_3, pseudoLog(maxHeight_2), maxHeight_2);
    float value = czm_branchFreeTernary(logarithmic_3, pseudoLog(height), height);
    float normalizedHeight = clamp((value - minHeight) / (maxHeight - minHeight), 0.0, 1.0);
    vec4 mappedColor = texture(colorMap_0, vec2(normalizedHeight, 0.5));
    return mappedColor.rgb;
  }
  return color;
}
