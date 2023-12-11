#define SAMPLES (8.0)

#ifndef OUTPUT_TYPE
#define OUTPUT_TYPE (0)
#endif

uniform sampler2D colorTexture;
uniform sampler2D depthTexture;
uniform float textureScale;
uniform float frustumLength;
uniform float normalExponent;
uniform float depthExponent;

in vec2 v_textureCoordinates;

const float sigma = float(SAMPLES) * 0.5 + 0.5;
const float falloff = 1.0 / (2.0 * sigma * sigma);

float computeWeight(
  const vec3 normal,
  const float depth,
  const vec3 normal0,
  const float depth0
) {
  // Weights are described here: http://sci.utah.edu/~duong/papers/hoang-mssao-cgi-2011-paper.pdf
  float normalWeight = pow(
    clamp(dot(normal0, normal), 0.0, 1.0),
    normalExponent
  );
  float depthWeight = pow(1.0 / (1.0 + abs(depth0 - depth)), depthExponent);
  return normalWeight * depthWeight;
}

void addWeight(
  const vec2 uv,
  const vec2 d,
  const vec2 dd,
  const vec3 normal0,
  const float depth0,
  inout float ao,
  inout float weight
) {
  vec4 aon = texture(colorTexture, uv + d);
  vec3 normal = unpackNormal(aon.yzw);
  // It will be much faster if we were able to write linear depths in the
  // generate phase.
  float depth = readPosition(depthTexture, uv + dd).z;
  float w = computeWeight(normal, depth, normal0, depth0);
  ao = aon.x * w + ao;
  weight += w;
}

void main() {
  vec2 uv = v_textureCoordinates;
  vec4 center = texture(colorTexture, uv);
  float depth0 = readPosition(depthTexture, uv).z;

  if (-depth0 > frustumLength) {
    #if OUTPUT_TYPE == 4 // Weight
    out_FragColor = vec4(vec3(0.0), center.yzw);
    #else
    out_FragColor = vec4(vec3(1.0), center.yzw);
    #endif // OUTPUT_TYPE
    return;
  }

  vec3 normal0 = unpackNormal(center.yzw);

  #if OUTPUT_TYPE == 4 // Weight
  float prevWeight = center.x;
  #endif

  vec2 pixelSize = 1.0 / czm_viewport.zw;
  #if DIRECTION == 0
  vec2 delta = vec2(pixelSize.x, 0.0) / textureScale;
  vec2 depthDelta = vec2(pixelSize.x, 0.0) * czm_pixelRatio;
  #else
  vec2 delta = vec2(0.0, pixelSize.y) / textureScale;
  vec2 depthDelta = vec2(0.0, pixelSize.y) * czm_pixelRatio;
  #endif // DIRECTION

  float ao = center.x;
  float weight = 1.0;
  float r = 1.0;

  for (; r <= SAMPLES / 2.0; r += 1.0) {
    vec2 d = r * delta;
    vec2 dd = r * depthDelta;
    addWeight(uv, d, dd, normal0, depth0, ao, weight);
    addWeight(uv, -d, -dd, normal0, depth0, ao, weight);
  }
  for (r += 0.5; r <= SAMPLES; r += 2.0) {
    vec2 d = r * delta;
    vec2 dd = r * depthDelta;
    addWeight(uv, d, dd, normal0, depth0, ao, weight);
    addWeight(uv, -d, -dd, normal0, depth0, ao, weight);
  }

  #if OUTPUT_TYPE == 4 // Weight
  #if DIRECTION == 0
  out_FragColor = vec4(weight * 0.05, center.yzw);
  #else
  out_FragColor = vec4(prevWeight + weight * 0.05, center.yzw);
  #endif // DIRECTION
  #else
  out_FragColor = vec4(ao / weight, center.yzw);
  #endif // OUTPUT_TYPE
}
