uniform vec3 u_reearth_sphericalHarmonicCoefficients[9];
uniform bool u_reearth_globeImageBasedLighting;

vec4 reearth_computeImageBasedLightingColor(vec4 color);
vec4 reearth_calculateElevationMapForGlobe();
