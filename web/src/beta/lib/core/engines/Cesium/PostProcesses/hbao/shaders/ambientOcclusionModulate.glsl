#ifndef OUTPUT_TYPE
#define OUTPUT_TYPE (0)
#endif

uniform sampler2D colorTexture;
uniform sampler2D depthTexture;
uniform sampler2D ambientOcclusionTexture;

uniform vec3 color;
uniform float blackPoint;
uniform float whitePoint;
uniform float gamma;
uniform float frustumLength;

in vec2 v_textureCoordinates;

vec3 shade(vec3 color, float a, float b, float p) {
  return clamp(
    b * pow(max(color - a, 0.0), vec3(p)) / pow(1.0 - a, p),
    vec3(0.0),
    vec3(1.0)
  );
}

void main() {
  vec4 base = texture(colorTexture, v_textureCoordinates);
  vec4 ao = texture(ambientOcclusionTexture, v_textureCoordinates);

  #if OUTPUT_TYPE == 1 // Occlusion
  out_FragColor = vec4(vec3(ao.x), base.a);
  #elif OUTPUT_TYPE == 2 // Normal
  out_FragColor = vec4(ao.yzw, base.a);
  #elif OUTPUT_TYPE == 3 // Depth
  float depth = -readPosition(depthTexture, v_textureCoordinates).z;
  out_FragColor = vec4(getTurboColormap(depth / frustumLength), base.a);
  #elif OUTPUT_TYPE == 4 // Weight
  out_FragColor = vec4(vec3(ao.x), base.a);
  #elif OUTPUT_TYPE == 5 // Shade
  out_FragColor = vec4(shade(base.rgb, blackPoint, whitePoint, gamma), base.a);
  #else
  out_FragColor = vec4(
    mix(base.rgb, shade(base.rgb, blackPoint, whitePoint, gamma), 1.0 - ao.x),
    base.a
  );
  #endif // OUTPUT_TYPE
}
