uniform sampler2D globeDepthTexture;

float readDepth(sampler2D depthTexture, vec2 texCoords) {
  // The depth texture doesn't include the terrain depth if
  // globe.depthTestAgainstTerrain is false, but terrain depth should be taken
  // into account to compute ambient occlusion. Automatic uniform
  // czm_globeDepthTexture always includes the terrain depth.
  // Assume that the terrain is always higher than ellipsoid.
  return czm_reverseLogDepth(
    min(
      texture(depthTexture, texCoords).r,
      czm_unpackDepth(texture(globeDepthTexture, texCoords))
    )
  );
}
