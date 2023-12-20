in vec3 v_positionEC;
in vec3 v_normalEC;
in vec3 v_tangentEC;
in vec3 v_bitangentEC;
in vec2 v_st;
in vec4 v_color;

void main() {
  vec3 positionToEyeEC = -v_positionEC;
  mat3 tangentToEyeMatrix = czm_tangentToEyeSpaceMatrix(
    v_normalEC,
    v_tangentEC,
    v_bitangentEC
  );
  vec3 normalEC = normalize(v_normalEC);

  // TODO: Make volumetric.
  czm_materialInput materialInput;
  materialInput.normalEC = normalEC;
  materialInput.tangentToEyeMatrix = tangentToEyeMatrix;
  materialInput.positionToEyeEC = positionToEyeEC;
  materialInput.st = v_st;
  czm_material material = czm_getMaterial(materialInput);
  material.alpha *= v_color.r;

  out_FragColor = czm_phong(
    normalize(positionToEyeEC),
    material,
    czm_lightDirectionEC
  );
}
