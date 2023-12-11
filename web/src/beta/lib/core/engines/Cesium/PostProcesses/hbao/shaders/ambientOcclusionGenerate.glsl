#ifndef NUM_DIRECTIONS
#define NUM_DIRECTIONS (8)
#endif

#ifndef NUM_STEPS
#define NUM_STEPS (8)
#endif

#ifndef OUTPUT_TYPE
#define OUTPUT_TYPE (0)
#endif

uniform sampler2D depthTexture;
uniform float textureScale;
uniform float intensity;
uniform float bias;
uniform float maxRadius;
uniform float frustumLength;
uniform vec2 focalLength;

in vec2 v_textureCoordinates;

vec2 rotateDirection(const vec2 dir, const vec2 cosSin) {
  return vec2(
    dir.x * cosSin.x - dir.y * cosSin.y,
    dir.x * cosSin.y + dir.y * cosSin.x
  );
}

vec2 getStepSize(const vec3 position) {
  vec2 uvMaxRadius = focalLength * maxRadius / -position.z;
  return 0.5 * uvMaxRadius / (float(NUM_STEPS) + 1.0);
}

vec2 getSnappedUV(const vec2 uv) {
  return round(uv * czm_viewport.zw) / czm_viewport.zw;
}

float getBiasedTangent(const vec3 v, const float bias) {
  return v.z / length(v.xy) + tan(bias);
}

float getSinFromTan(const float x) {
  return x * inversesqrt(x * x + 1.0);
}

// Based on:
// https://github.com/nvpro-samples/gl_ssao/blob/master/hbao.frag.glsl
// https://github.com/scanberg/hbao/blob/master/resources/shaders/hbao_full_frag.glsl
float computeOcclusion(
  vec3 position,
  vec3 dPdx,
  vec3 dPdy,
  vec2 deltaUV,
  float randomStep
) {
  // Offset the first coord with some noise.
  vec2 uv = v_textureCoordinates + getSnappedUV(randomStep * deltaUV);
  deltaUV = getSnappedUV(deltaUV);

  // Calculate the tangent vector.
  vec3 T = dPdx * deltaUV.x + dPdy * deltaUV.y;

  // Get the angle of the tangent vector from the viewspace axis.
  float tanT = getBiasedTangent(T, bias);
  float sinT = getSinFromTan(tanT);

  // Sample to find the maximum angle.
  float ao = 0.0;
  float prevSinH = sinT;
  for (int i = 0; i < NUM_STEPS; ++i) {
    uv += deltaUV;

    float sampleDepth = readDepth(depthTexture, uv);
    vec3 samplePosition = reconstructPosition(uv, sampleDepth);
    vec3 view = samplePosition - position;
    float len = length(view);

    float tanH = view.z / length(view.xy);
    float sinH = getSinFromTan(tanH);
    if (len < maxRadius && sinH > prevSinH) {
      float falloff = 1.0 - len / maxRadius * (len / maxRadius);
      ao += (sinH - prevSinH) * falloff;
      prevSinH = sinH;
    }
  }

  return ao;
}

void main() {
  vec2 uv = v_textureCoordinates;
  float depth = readDepth(depthTexture, uv);
  vec3 position = reconstructPosition(uv, depth);

  #if OUTPUT_TYPE != 1
  if (-position.z > frustumLength) {
    out_FragColor = vec4(1.0);
    return;
  }
  #endif

  // Should we take czm_pixelRatio into account?
  vec2 pixelSize = textureScale / czm_viewport.zw;
  vec3 dPdx;
  vec3 dPdy;
  vec3 normal = reconstructNormal(
    depthTexture,
    uv,
    position,
    depth,
    pixelSize,
    dPdx,
    dPdy
  );

  // XY for direction and Z for jitter of the first step.
  vec3 random = computeHighPassRandom3D(uv);

  float ao = 0.0;

  vec2 stepSize = getStepSize(position);
  float alpha = czm_twoPi / float(NUM_DIRECTIONS);
  for (
    int directionIndex = 0;
    directionIndex < NUM_DIRECTIONS;
    ++directionIndex
  ) {
    // Compute normalized random direction.
    float theta = alpha * float(directionIndex);
    vec2 direction = rotateDirection(
      vec2(cos(theta), sin(theta)),
      normalize(2.0 * random.xy - 1.0)
    );

    ao += computeOcclusion(
      position,
      dPdx,
      dPdy,
      direction * stepSize,
      random.z
    );
  }

  ao /= float(NUM_DIRECTIONS * NUM_STEPS);
  ao = 1.0 - 1.0 / czm_twoPi * clamp(ao, 0.0, 1.0);
  ao = pow(ao, intensity);

  // Reuse normal in bilateral filter and read depth in it again.
  out_FragColor = vec4(ao, packNormal(normal));
}
