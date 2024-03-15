/**
 * This file refers this implementation.
 * https://github.com/takram-design-engineering/plateau-view/blob/8ea8bf1d5ef64319d92d0eb05b936cca7f1a2e8f/libs/cesium/src/useGlobeShader.tsx
 */

import { ShaderSource } from "@cesium/engine";
import { Viewer, Globe, Material, Cartesian3 } from "cesium";
import { RefObject, useEffect, useMemo } from "react";
import { CesiumComponentRef } from "resium";

import { TerrainProperty } from "..";
import { useImmutableFunction } from "../../hooks/useRefFunction";
import { StringMatcher } from "../../utils/StringMatcher";

import { createColorMapImage } from "./Feature/HeatMap/colorMap";
import GlobeFSDefinitions from "./Shaders/OverriddenShaders/GlobeFS/Definitions.glsl?raw";
import HeatmapForTerrainFS from "./Shaders/OverriddenShaders/GlobeFS/HeatmapForTerrain.glsl?raw";
import IBLFS from "./Shaders/OverriddenShaders/GlobeFS/IBL.glsl?raw";
import { PrivateCesiumGlobe } from "./types";
import { VertexTerrainElevationMaterial } from "./VertexTerrainElevationMaterial";

const defaultMatcher = new StringMatcher()
  // Use the diffuse of the globe material as initial color, as I want to
  // render imagery layers over it.
  .replace(
    "vec4 color = computeDayColor(u_initialColor",
    /* glsl */ `
    vec4 initialColor;
    #ifdef APPLY_MATERIAL
      czm_materialInput materialInput;
      materialInput.st = v_textureCoordinates.st;
      materialInput.normalEC = normalize(v_normalEC);
      materialInput.positionToEyeEC = -v_positionEC;
      materialInput.tangentToEyeMatrix = czm_eastNorthUpToEyeCoordinates(v_positionMC, normalize(v_normalEC));
      materialInput.slope = v_slope;
      materialInput.height = v_height;
      materialInput.aspect = v_aspect;
      czm_material material = czm_getMaterial(materialInput);
      initialColor = vec4(material.diffuse, material.alpha);
    #else
      initialColor = u_initialColor;
    #endif
    vec4 color = computeDayColor(initialColor`,
  )
  .erase([
    "#ifdef APPLY_MATERIAL",
    "czm_materialInput materialInput;",
    "materialInput.st = v_textureCoordinates.st;",
    "materialInput.normalEC = normalize(v_normalEC);",
    "materialInput.positionToEyeEC = -v_positionEC;",
    "materialInput.tangentToEyeMatrix = czm_eastNorthUpToEyeCoordinates(v_positionMC, normalize(v_normalEC));",
    "materialInput.slope = v_slope;",
    "materialInput.height = v_height;",
    "materialInput.aspect = v_aspect;",
    "czm_material material = czm_getMaterial(materialInput);",
    "vec4 materialColor = vec4(material.diffuse, material.alpha);",
    "color = alphaBlend(materialColor, color);",
    "#endif",
  ]);

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

const useIBL = ({
  sphericalHarmonicCoefficients,
  globeImageBasedLighting,
  hasVertexNormals,
  enableLighting,
}: {
  sphericalHarmonicCoefficients?: Cartesian3[];
  globeImageBasedLighting?: boolean;
  hasVertexNormals?: boolean;
  enableLighting?: boolean;
}) => {
  const isIBLEnabled = useMemo(
    () => hasVertexNormals && enableLighting,
    [hasVertexNormals, enableLighting],
  );
  const sphericalHarmonicCoefficientsRefFunc = useImmutableFunction(
    sphericalHarmonicCoefficients || [],
  );
  const globeImageBasedLightingRefFunc = useImmutableFunction(
    globeImageBasedLighting && !!sphericalHarmonicCoefficients,
  );
  const uniformMapForIBL = useMemo(
    () => ({
      u_reearth_sphericalHarmonicCoefficients: sphericalHarmonicCoefficientsRefFunc,
      u_reearth_globeImageBasedLighting: globeImageBasedLightingRefFunc,
    }),
    [sphericalHarmonicCoefficientsRefFunc, globeImageBasedLightingRefFunc],
  );
  const shaderForIBL = useMemo(
    () =>
      new StringMatcher().replace(
        [
          "float diffuseIntensity = clamp(czm_getLambertDiffuse(czm_lightDirectionEC, normalize(v_normalEC)) * u_lambertDiffuseMultiplier + u_vertexShadowDarkness, 0.0, 1.0);",
          "vec4 finalColor = vec4(color.rgb * czm_lightColor * diffuseIntensity, color.a);",
        ],
        "vec4 finalColor = reearth_computeImageBasedLightingColor(color);",
      ),
    [],
  );

  return {
    uniformMapForIBL,
    isIBLEnabled,
    shaderForIBL,
  };
};

const useTerrainHeatmap = ({
  cesium,
  terrain: {
    heatmapType,
    heatmapMaxHeight,
    heatmapMinHeight,
    heatmapLogarithmic,
    heatmapColorLUT,
  } = {},
}: {
  cesium: RefObject<CesiumComponentRef<Viewer>>;
  terrain: TerrainProperty | undefined;
}) => {
  const isCustomHeatmapEnabled = useMemo(() => heatmapType === "custom", [heatmapType]);

  const shaderForTerrainHeatmap = useMemo(
    () =>
      new StringMatcher().replace(
        [
          "#ifdef APPLY_COLOR_TO_ALPHA",
          "vec3 colorDiff = abs(color.rgb - colorToAlpha.rgb);",
          "colorDiff.r = max(max(colorDiff.r, colorDiff.g), colorDiff.b);",
          "alpha = czm_branchFreeTernary(colorDiff.r < colorToAlpha.a, 0.0, alpha);",
          "#endif",
        ],
        `color = reearth_calculateElevationMapForGlobe(colorToAlpha, color);`,
      ),
    [],
  );

  useEffect(() => {
    if (!cesium.current?.cesiumElement || !isCustomHeatmapEnabled) return;
    const globe = cesium.current.cesiumElement.scene.globe as PrivateCesiumGlobe;

    globe.material = new VertexTerrainElevationMaterial();

    return () => {
      globe.material = undefined;
    };
  }, [cesium, isCustomHeatmapEnabled]);

  useEffect(() => {
    if (!cesium.current?.cesiumElement || !isCustomHeatmapEnabled) return;
    const globe = cesium.current.cesiumElement.scene.globe as PrivateCesiumGlobe;
    if (!(globe.material instanceof VertexTerrainElevationMaterial)) return;

    globe.material.uniforms.minHeight = heatmapMinHeight ?? globe.material.uniforms.minHeight;
    globe.material.uniforms.maxHeight = heatmapMaxHeight ?? globe.material.uniforms.maxHeight;
    globe.material.uniforms.logarithmic = heatmapLogarithmic ?? globe.material.uniforms.logarithmic;
  }, [cesium, isCustomHeatmapEnabled, heatmapMaxHeight, heatmapMinHeight, heatmapLogarithmic]);

  useEffect(() => {
    if (!cesium.current?.cesiumElement || !isCustomHeatmapEnabled || !heatmapColorLUT) return;
    const globe = cesium.current.cesiumElement.scene.globe as PrivateCesiumGlobe;
    if (!(globe.material instanceof VertexTerrainElevationMaterial)) return;

    globe.material.uniforms.colorMap = createColorMapImage(heatmapColorLUT);
  }, [cesium, isCustomHeatmapEnabled, heatmapColorLUT]);

  return { isCustomHeatmapEnabled, shaderForTerrainHeatmap };
};

export const useOverrideGlobeShader = ({
  cesium,
  sphericalHarmonicCoefficients,
  globeShadowDarkness,
  globeImageBasedLighting,
  hasVertexNormals,
  enableLighting,
  terrain,
}: {
  cesium: RefObject<CesiumComponentRef<Viewer>>;
  sphericalHarmonicCoefficients?: Cartesian3[];
  globeShadowDarkness?: number;
  globeImageBasedLighting?: boolean;
  hasVertexNormals?: boolean;
  enableLighting?: boolean;
  terrain: TerrainProperty | undefined;
}) => {
  const { uniformMapForIBL, isIBLEnabled, shaderForIBL } = useIBL({
    sphericalHarmonicCoefficients,
    globeImageBasedLighting,
    hasVertexNormals,
    enableLighting,
  });

  const { isCustomHeatmapEnabled, shaderForTerrainHeatmap } = useTerrainHeatmap({
    cesium,
    terrain,
  });

  useEffect(() => {
    if (!cesium.current?.cesiumElement || !hasVertexNormals) return;
    const globe = cesium.current.cesiumElement.scene.globe as PrivateCesiumGlobe;

    globe.vertexShadowDarkness = globeShadowDarkness ?? globe.vertexShadowDarkness;
  }, [cesium, globeShadowDarkness, hasVertexNormals]);

  // This need to be invoked before Globe is updated.
  useEffect(() => {
    // NOTE: Support the spherical harmonic coefficient only when the terrain normal is enabled.
    // Because it's difficult to control the shader for the entire globe.
    // ref: https://github.com/CesiumGS/cesium/blob/af4e2bebbef25259f049b05822adf2958fce11ff/packages/engine/Source/Shaders/GlobeFS.glsl#L408
    if (!cesium.current?.cesiumElement || (!isIBLEnabled && !isCustomHeatmapEnabled)) return;
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

    const matchers: StringMatcher[] = [];
    const shaders: string[] = [];
    if (isIBLEnabled) {
      matchers.push(shaderForIBL);
      shaders.push(IBLFS);
    }

    if (isCustomHeatmapEnabled) {
      // This will log the variables needed in the shader below.
      // we need the minHeight, maxHeight and logarithmic
      matchers.push(shaderForTerrainHeatmap);
      shaders.push(HeatmapForTerrainFS);
    }

    // This means there is no overridden shader.
    if (!matchers.length) return;

    if (!globe?._surface?._tileProvider) {
      if (import.meta.env.DEV) {
        throw new Error("`globe._surface._tileProvider.materialUniformMap` could not found");
      }
      return;
    }

    makeGlobeShadersDirty(globe);

    const replacedGlobeFS = defaultMatcher.concat(...matchers).execute(GlobeFS);

    globe._surface._tileProvider.materialUniformMap = {
      ...(globe._surface._tileProvider.materialUniformMap ?? {}),
      ...uniformMapForIBL,
    };

    surfaceShaderSet.baseFragmentShaderSource = new ShaderSource({
      sources: [
        ...baseFragmentShaderSource.sources.slice(0, -1),
        GlobeFSDefinitions + replacedGlobeFS + shaders.join(""),
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
    uniformMapForIBL,
    enableLighting,
    cesium,
    hasVertexNormals,
    isCustomHeatmapEnabled,
    isIBLEnabled,
    shaderForIBL,
    shaderForTerrainHeatmap,
  ]);
};
