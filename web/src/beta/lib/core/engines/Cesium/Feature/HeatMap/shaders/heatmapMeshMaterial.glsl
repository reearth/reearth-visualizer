// ref: https://github.com/takram-design-engineering/plateau-view/blob/main/libs/heatmap/src/shaders/heatmapMeshMaterial.glsl

uniform sampler2D colorMap;
uniform sampler2D image;
uniform vec2 imageScale;
uniform vec2 imageOffset;
uniform float width;
uniform float height;
uniform float opacity;
uniform float contourSpacing;
uniform float contourThickness;
uniform float contourAlpha;
uniform bool logarithmic;

#define LOG_10 (2.302585092994046)

float pseudoLog(float value) {
  return value > 10.0
    ? log(value) / LOG_10
    : value < -10.0
      ? -log(-value) / LOG_10
      : value / 10.0;
}

czm_material czm_getMaterial(czm_materialInput materialInput) {
  vec2 texSize = vec2(width, height);
  vec2 texelSize = 1.0 / texSize;
  vec2 pair = sampleBicubic(
    image,
    // TODO: Derive geographic coordinates from UV and unproject them to find
    // non-linear sampling coordinates.
    materialInput.st * imageScale + imageOffset,
    texSize,
    texelSize
  );
  float value = pair.x;
  float alpha = pair.y;

  float scaledMinValue = czm_branchFreeTernary(
    logarithmic,
    pseudoLog(minValue),
    minValue
  );
  float scaledMaxValue = czm_branchFreeTernary(
    logarithmic,
    pseudoLog(maxValue),
    maxValue
  );
  float scaledValue = czm_branchFreeTernary(
    logarithmic,
    pseudoLog(value),
    value
  );

  float normalizedValue = clamp(
    (scaledValue - scaledMinValue) / (scaledMaxValue - scaledMinValue),
    0.0,
    1.0
  );
  vec3 color = texture(colorMap, vec2(normalizedValue, 0.5)).rgb;
  color = czm_gammaCorrect(color);

  float contour = makeContour(
    value - minValue,
    contourSpacing,
    contourThickness
  );
  color = mix(
    color,
    vec3(step(dot(color, vec3(0.299, 0.587, 0.114)), 0.5)),
    contour * contourAlpha
  );

  czm_material material = czm_getDefaultMaterial(materialInput);
  material.diffuse = color;
  material.alpha = opacity * alpha;
  return material;
}
