vec3 reconstructPosition(const vec2 uv, const float depth) {
  vec2 xy = vec2(uv.x * 2.0 - 1.0, (1.0 - uv.y) * 2.0 - 1.0);
  vec4 position = czm_inverseProjection * vec4(xy, depth, 1.0);
  position = position / position.w;
  return position.xyz;
}

vec3 readPosition(const sampler2D depthTexture, const vec2 uv) {
  return reconstructPosition(uv, readDepth(depthTexture, uv));
}
