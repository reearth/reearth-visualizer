// Based on https://github.com/pmndrs/drei/blob/master/src/core/softShadows.tsx

vec3 computeRandom3D(const vec2 uv) {
  return vec3(
    fract(sin(dot(uv, vec2(12.75613, 38.12123))) * 13234.76575),
    fract(sin(dot(uv, vec2(19.45531, 58.46547))) * 43678.23431),
    fract(sin(dot(uv, vec2(23.67817, 78.23121))) * 93567.23423)
  );
}

vec3 computeLowPassRandom3D(const vec2 uv) {
  vec3 result = vec3(0.0);
  result += computeRandom3D(uv + vec2(-1.0, -1.0));
  result += computeRandom3D(uv + vec2(-1.0, 0.0));
  result += computeRandom3D(uv + vec2(-1.0, 1.0));
  result += computeRandom3D(uv + vec2(0.0, -1.0));
  result += computeRandom3D(uv + vec2(0.0, 0.0));
  result += computeRandom3D(uv + vec2(0.0, 1.0));
  result += computeRandom3D(uv + vec2(1.0, -1.0));
  result += computeRandom3D(uv + vec2(1.0, 0.0));
  result += computeRandom3D(uv + vec2(1.0, 1.0));
  result *= 0.111111111; // 1.0 / 9.0
  return result;
}

vec3 computeHighPassRandom3D(const vec2 uv) {
  return computeRandom3D(uv) - computeLowPassRandom3D(uv) + 0.5;
}
