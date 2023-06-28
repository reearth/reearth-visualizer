import { ShaderSource } from "@cesium/engine";
import { Viewer, Globe, Material, Cartesian3 } from "cesium";
import { RefObject, useEffect } from "react";
import { CesiumComponentRef } from "resium";

import { useImmutableFunction } from "../../hooks/useRefFunction";

import CesiumGlobeFS from "./Shaders/OverriddenShaders/GlobeFS/Cesium.glsl?raw";
import GlobeFSCustoms from "./Shaders/OverriddenShaders/GlobeFS/Customs.glsl?raw";
import GlobeFSDefinitions from "./Shaders/OverriddenShaders/GlobeFS/Definitions.glsl?raw";
import { PrivateCesiumGlobe } from "./types";

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
}: {
  cesium: RefObject<CesiumComponentRef<Viewer>>;
  sphericalHarmonicCoefficients?: Cartesian3[];
  globeShadowDarkness?: number;
  globeImageBasedLighting?: boolean;
  hasVertexNormals?: boolean;
}) => {
  const sphericalHarmonicCoefficientsRefFunc = useImmutableFunction(
    sphericalHarmonicCoefficients || [],
  );
  const globeImageBasedLightingRefFunc = useImmutableFunction(globeImageBasedLighting);

  useEffect(() => {
    if (!cesium.current?.cesiumElement || !globeShadowDarkness || !hasVertexNormals) return;
    const globe = cesium.current.cesiumElement.scene.globe as PrivateCesiumGlobe;

    globe.vertexShadowDarkness = globeShadowDarkness;
  }, [cesium, globeShadowDarkness, hasVertexNormals]);

  // This need to be invoked before Globe is updated.
  useEffect(() => {
    if (!cesium.current?.cesiumElement || !hasVertexNormals) return;
    const globe = cesium.current.cesiumElement.scene.globe as PrivateCesiumGlobe;

    makeGlobeShadersDirty(globe);

    globe._surface._tileProvider.materialUniformMap = {
      ...globe._surface._tileProvider.materialUniformMap,
      u_reearth_sphericalHarmonicCoefficients: sphericalHarmonicCoefficientsRefFunc,
      u_reearth_globeImageBasedLighting: globeImageBasedLightingRefFunc, // Avoid to rerender globe.
    };

    const surfaceShaderSet = globe._surfaceShaderSet;
    const baseFragmentShaderSource = surfaceShaderSet.baseFragmentShaderSource;
    surfaceShaderSet.baseFragmentShaderSource = new ShaderSource({
      sources: [
        ...baseFragmentShaderSource.sources.slice(0, -1),
        GlobeFSDefinitions + CesiumGlobeFS + GlobeFSCustoms,
      ],
      defines: baseFragmentShaderSource.defines,
    });
    return () => {
      // Reset customized shader to default
      makeGlobeShadersDirty(globe);
    };
  }, [
    sphericalHarmonicCoefficientsRefFunc,
    globeImageBasedLightingRefFunc,
    cesium,
    hasVertexNormals,
  ]);
};
