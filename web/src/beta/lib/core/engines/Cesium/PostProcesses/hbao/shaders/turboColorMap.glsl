// Derived from https://gist.github.com/mikhailov-work/0d177465a8151eb6ede1768d51d476c7

const vec4 kRedVec4 = vec4(0.13572138, 4.6153926, -42.66032258, 132.13108234);
const vec4 kGreenVec4 = vec4(0.09140261, 2.19418839, 4.84296658, -14.18503333);
const vec4 kBlueVec4 = vec4(0.1066733, 12.64194608, -60.58204836, 110.36276771);
const vec2 kRedVec2 = vec2(-152.94239396, 59.28637943);
const vec2 kGreenVec2 = vec2(4.27729857, 2.82956604);
const vec2 kBlueVec2 = vec2(-89.90310912, 27.34824973);

vec3 getTurboColormap(const float v) {
  float x = clamp(v, 0.0, 1.0);
  float x2 = x * x;
  vec4 v4 = vec4(1.0, x, x2, x2 * x);
  vec2 v2 = v4.zw * v4.z;
  return vec3(
    dot(v4, kRedVec4) + dot(v2, kRedVec2),
    dot(v4, kGreenVec4) + dot(v2, kGreenVec2),
    dot(v4, kBlueVec4) + dot(v2, kBlueVec2)
  );
}
