vec3 packNormal(const vec3 normal) {
  return normalize(normal) * 0.5 + 0.5;
}

vec3 unpackNormal(const vec3 normal) {
  return normal * 2.0 - 1.0;
}
