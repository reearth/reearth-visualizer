/**
 * This file refers this implementation.
 * https://github.com/takram-design-engineering/plateau-view/blob/8ea8bf1d5ef64319d92d0eb05b936cca7f1a2e8f/libs/cesium/src/useGlobeShader.tsx
 */

import { ShaderSource } from "@cesium/engine";
import { Viewer, Globe, Material, Cartesian3 } from "cesium";
import { RefObject, useEffect } from "react";
import { CesiumComponentRef } from "resium";

import { useImmutableFunction } from "../../hooks/useRefFunction";
import { StringMatcher } from "../../utils/StringMatcher";

import GlobeFSCustoms from "./Shaders/OverriddenShaders/GlobeFS/Customs.glsl?raw";
import GlobeFSDefinitions from "./Shaders/OverriddenShaders/GlobeFS/Definitions.glsl?raw";
import { PrivateCesiumGlobe } from "./types";
import { VertexTerrainElevationMaterial } from "./VertexTerrainElevationMaterial";

function makeGlobeShadersDirty(globe: Globe): void {
  // Invoke the internal makeShadersDirty() by setting a material to globe to
  // reset surface shader source to the initial state (assuming that we never
  // use custom material on globe).
  // ref: https://github.com/CesiumGS/cesium/blob/1.106/packages/engine/Source/Scene/Globe.js#L562-L572
  const material = globe.material;
  if (material == null) {
    globe.material = Material.fromType("Color");
    globe.material = undefined;
  } else {
    globe.material = undefined;
    globe.material = material;
  }
}

export const useOverrideGlobeShader = ({
  cesium,
  sphericalHarmonicCoefficients,
  globeShadowDarkness,
  globeImageBasedLighting,
  hasVertexNormals,
  enableLighting,
}: {
  cesium: RefObject<CesiumComponentRef<Viewer>>;
  sphericalHarmonicCoefficients?: Cartesian3[];
  globeShadowDarkness?: number;
  globeImageBasedLighting?: boolean;
  hasVertexNormals?: boolean;
  enableLighting?: boolean;
}) => {
  const sphericalHarmonicCoefficientsRefFunc = useImmutableFunction(
    sphericalHarmonicCoefficients || [],
  );
  const globeImageBasedLightingRefFunc = useImmutableFunction(
    globeImageBasedLighting && !!sphericalHarmonicCoefficients,
  );

  useEffect(() => {
    if (!cesium.current?.cesiumElement || !globeShadowDarkness || !hasVertexNormals) return;
    const globe = cesium.current.cesiumElement.scene.globe as PrivateCesiumGlobe;

    globe.vertexShadowDarkness = globeShadowDarkness;
  }, [cesium, globeShadowDarkness, hasVertexNormals]);

  // This need to be invoked before Globe is updated.
  useEffect(() => {
    // NOTE: Support the spherical harmonic coefficient only when the terrain normal is enabled.
    // Because it's difficult to control the shader for the entire globe.
    // ref: https://github.com/CesiumGS/cesium/blob/af4e2bebbef25259f049b05822adf2958fce11ff/packages/engine/Source/Shaders/GlobeFS.glsl#L408
    // if (!cesium.current?.cesiumElement || !enableLighting || !hasVertexNormals) return;
    // TODO: Fix this befor merge
    if (!cesium.current?.cesiumElement || !hasVertexNormals) return;
    const globe = cesium.current.cesiumElement.scene.globe as PrivateCesiumGlobe;

    const surfaceShaderSet = globe._surfaceShaderSet;
    if (!surfaceShaderSet) {
      if (import.meta.env.DEV) {
        throw new Error("`globe._surfaceShaderSet` could not found");
      }
      return;
    }

    const baseFragmentShaderSource = surfaceShaderSet.baseFragmentShaderSource;

    const GlobeFS = baseFragmentShaderSource?.sources[baseFragmentShaderSource.sources.length - 1];

    if (!GlobeFS) {
      if (import.meta.env.DEV) {
        throw new Error("GlobeFS could not find.");
      }
      return;
    }

    let replacedGlobeFS;
    try {
      // TODO: Fix this befor merge
      // replacedGlobeFS = new StringMatcher()
      //   .replace(
      //     [
      //       "float diffuseIntensity = clamp(czm_getLambertDiffuse(czm_lightDirectionEC, normalize(v_normalEC)) * u_lambertDiffuseMultiplier + u_vertexShadowDarkness, 0.0, 1.0);",
      //       "vec4 finalColor = vec4(color.rgb * czm_lightColor * diffuseIntensity, color.a);",
      //     ],
      //     "vec4 finalColor = reearth_computeImageBasedLightingColor(color);",
      //   )
      //   .execute(GlobeFS);
      console.log("Shader execution start!!");
      globe.material = new VertexTerrainElevationMaterial();
      globe.material.uniforms.minHeight = 0;
      globe.material.uniforms.maxHeight = 4000;
      globe.material.uniforms.logarithmic = true;

      // This will log the variables needed in the shader below.
      // we need the minHeight, maxHeight and logarithmic
      console.log(globe.material);
      replacedGlobeFS = new StringMatcher()
        .replace(
          [
            "#ifdef APPLY_COLOR_TO_ALPHA",
            "vec3 colorDiff = abs(color.rgb - colorToAlpha.rgb);",
            "colorDiff.r = max(max(colorDiff.r, colorDiff.g), colorDiff.b);",
            "alpha = czm_branchFreeTernary(colorDiff.r < colorToAlpha.a, 0.0, alpha);",
            "#endif",
          ],
          `
          // colorToAlpha is used as an identification of imagery layer here.
          if (greaterThan(colorToAlpha, vec4(0.9)) == bvec4(true)) {
            float decodedValue = dot(color, vec3(16711680.0, 65280.0, 255.0));
            float height = (decodedValue - 8388607.0) * 0.01;
            float minHeight = czm_branchFreeTernary(
              logarithmic_3,
              pseudoLog(minHeight_1),
              minHeight_1
            );
            float maxHeight = czm_branchFreeTernary(
              logarithmic_3,
              pseudoLog(maxHeight_2),
              maxHeight_2
            );
            float value = czm_branchFreeTernary(
              logarithmic_3,
              pseudoLog(height),
              height
            );
            float normalizedHeight = clamp(
              (value - minHeight) / (maxHeight - minHeight),
              0.0,
              1.0
            );
            vec4 mappedColor = texture(colorMap_0, vec2(normalizedHeight, 0.5));
            color = mappedColor.rgb;
            }
        `,
        )
        .execute(GlobeFS);
      console.log("shader execution ended !!");
    } catch (e) {
      if (import.meta.env.DEV) {
        throw new Error(`Failed to override GlobeFS: ${JSON.stringify(e)}`);
      }
      return;
    }

    if (!globe?._surface?._tileProvider) {
      if (import.meta.env.DEV) {
        throw new Error("`globe._surface._tileProvider.materialUniformMap` could not found");
      }
      return;
    }

    makeGlobeShadersDirty(globe);

    globe._surface._tileProvider.materialUniformMap = {
      ...(globe._surface._tileProvider.materialUniformMap ?? {}),
      u_reearth_sphericalHarmonicCoefficients: sphericalHarmonicCoefficientsRefFunc,
      u_reearth_globeImageBasedLighting: globeImageBasedLightingRefFunc, // Avoid to rerender globe.
    };

    surfaceShaderSet.baseFragmentShaderSource = new ShaderSource({
      sources: [
        ...baseFragmentShaderSource.sources.slice(0, -1),
        GlobeFSDefinitions + replacedGlobeFS + GlobeFSCustoms,
      ],
      defines: baseFragmentShaderSource.defines,
    });
    return () => {
      if (!globe.isDestroyed()) {
        // Reset customized shader to default
        makeGlobeShadersDirty(globe);
      }
    };
  }, [
    sphericalHarmonicCoefficientsRefFunc,
    globeImageBasedLightingRefFunc,
    enableLighting,
    cesium,
    hasVertexNormals,
  ]);
};
