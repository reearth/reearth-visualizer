// Derived from https://www.gamedev.net/tutorials/programming/graphics/contact-hardening-soft-shadows-made-fast-r4906/

float getInterleavedGradientNoise(const vec2 uv) {
  vec3 magic = vec3(0.06711056, 0.00583715, 52.9829189);
  return fract(magic.z * fract(dot(uv, magic.xy)));
}

vec3 getVogelDisk(const float index, const float count, const float phi) {
  float goldenAngle = 2.4;
  float theta = index * goldenAngle + phi;
  float r = sqrt(index + 0.5) / sqrt(count);
  return vec3(cos(theta), sin(theta), r);
}
