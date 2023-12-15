in vec3 position3DHigh;
in vec3 position3DLow;
in vec3 normal;
in vec3 normal;
in vec3 tangent;
in vec3 bitangent;
in vec2 st;
in vec4 color;
in float batchId;

out vec3 v_positionEC;
out vec3 v_normalEC;
out vec3 v_tangentEC;
out vec3 v_bitangentEC;
out vec2 v_st;
out vec4 v_color;

void main() {
  vec4 p = czm_computePosition();

  v_positionEC = (czm_modelViewRelativeToEye * p).xyz;
  v_normalEC = czm_normal * normal;
  v_tangentEC = czm_normal * tangent;
  v_bitangentEC = czm_normal * bitangent;
  v_st = st;
  v_color = color;

  gl_Position = czm_modelViewProjectionRelativeToEye * p;
}
