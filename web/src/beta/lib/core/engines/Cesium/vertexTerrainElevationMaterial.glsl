uniform sampler2D colorMap;
uniform float minHeight;
uniform float maxHeight;
uniform bool logarithmic;
uniform float heightDatum;

#define LOG_10 (2.302585092994046)

float pseudoLog(float value) {
    return value > 10.0 ? log(value) / LOG_10 : value < -10.0 ? -log(-value) / LOG_10 : value / 10.0;
}

czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    float height = materialInput.height + heightDatum;
    float minHeight = czm_branchFreeTernary(logarithmic, pseudoLog(minHeight), minHeight);
    float maxHeight = czm_branchFreeTernary(logarithmic, pseudoLog(maxHeight), maxHeight);
    float value = czm_branchFreeTernary(logarithmic, pseudoLog(height), height);
    float normalizedHeight = clamp((value - minHeight) / (maxHeight - minHeight), 0.0, 1.0);
    vec4 mappedColor = texture(colorMap, vec2(normalizedHeight, 0.5));
    mappedColor = czm_gammaCorrect(mappedColor);
    material.diffuse = mappedColor.rgb;
    material.alpha = mappedColor.a;
    return material;
}
