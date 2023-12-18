// ref: https://github.com/takram-design-engineering/plateau-view/blob/main/libs/heatmap/src/shaders/makeContour.glsl
// Reference: https://github.com/CesiumGS/cesium/blob/main/packages/engine/Source/Shaders/Materials/ElevationContourMaterial.glsl

float makeContour(float value, float spacing, float width) {
  if (value < spacing) {
    return 0.0;
  }
  float distanceToContour = mod(value + 0.5, spacing);
  float dx = abs(dFdx(value));
  float dy = abs(dFdy(value));
  float f = max(dx, dy) * czm_pixelRatio * width;
  return step(distanceToContour, f);
}
