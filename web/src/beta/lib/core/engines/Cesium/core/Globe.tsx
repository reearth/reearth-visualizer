import {
  ArcGISTiledElevationTerrainProvider,
  CesiumTerrainProvider,
  EllipsoidTerrainProvider,
  IonResource,
  TerrainProvider,
} from "cesium";
import { pick } from "lodash-es";
import { useMemo } from "react";
import { Globe as CesiumGlobe } from "resium";

import { objKeys } from "@reearth/beta/utils/util";

import type { SceneProperty, TerrainProperty } from "../..";
import { toColor } from "../common";

export type Props = {
  property?: SceneProperty;
  cesiumIonAccessToken?: string;
};

export default function Globe({ property, cesiumIonAccessToken }: Props): JSX.Element | null {
  const terrainProperty = useMemo(
    (): TerrainProperty => ({
      ...property?.terrain,
      ...pick(property?.default, terrainPropertyKeys),
    }),
    [property?.terrain, property?.default],
  );

  const terrainProvider = useMemo((): Promise<TerrainProvider> | TerrainProvider | undefined => {
    const opts = {
      terrain: terrainProperty?.terrain,
      terrainType: terrainProperty?.terrainType,
      terrainNormal: terrainProperty?.terrainNormal,
      terrainCesiumIonAccessToken:
        terrainProperty?.terrainCesiumIonAccessToken || cesiumIonAccessToken,
      terrainCesiumIonAsset: terrainProperty?.terrainCesiumIonAsset,
      terrainCesiumIonUrl: terrainProperty?.terrainCesiumIonUrl,
    };
    const provider = opts.terrain ? terrainProviders[opts.terrainType || "cesium"] : undefined;
    return (typeof provider === "function" ? provider(opts) : provider) ?? defaultTerrainProvider;
  }, [
    terrainProperty?.terrain,
    terrainProperty?.terrainType,
    terrainProperty?.terrainCesiumIonAccessToken,
    terrainProperty?.terrainCesiumIonAsset,
    terrainProperty?.terrainCesiumIonUrl,
    terrainProperty?.terrainNormal,
    cesiumIonAccessToken,
  ]);

  const baseColor = useMemo(
    () => toColor(property?.atmosphere?.globeBaseColor),
    [property?.atmosphere?.globeBaseColor],
  );

  return (
    <CesiumGlobe
      baseColor={baseColor}
      enableLighting={
        !!(property?.atmosphere?.enable_lighting ?? property?.globeLighting?.globeLighting)
      }
      showGroundAtmosphere={
        property?.atmosphere?.ground_atmosphere ??
        property?.globeAtmosphere?.globeAtmosphere ??
        true
      }
      atmosphereLightIntensity={property?.globeAtmosphere?.globeAtmosphereIntensity}
      atmosphereSaturationShift={property?.atmosphere?.surturation_shift}
      atmosphereHueShift={property?.atmosphere?.hue_shift}
      atmosphereBrightnessShift={property?.atmosphere?.brightness_shift}
      terrainProvider={terrainProvider}
      depthTestAgainstTerrain={!!terrainProperty.depthTestAgainstTerrain}
    />
  );
}

const terrainPropertyKeys = objKeys<TerrainProperty>({
  terrain: 0,
  terrainType: 0,
  terrainExaggeration: 0,
  terrainExaggerationRelativeHeight: 0,
  depthTestAgainstTerrain: 0,
  terrainCesiumIonAsset: 0,
  terrainCesiumIonAccessToken: 0,
  terrainCesiumIonUrl: 0,
  terrainUrl: 0,
});

const defaultTerrainProvider = new EllipsoidTerrainProvider();

const terrainProviders: {
  [k in NonNullable<TerrainProperty["terrainType"]>]:
    | TerrainProvider
    | ((
        opts: Pick<
          TerrainProperty,
          | "terrainCesiumIonAccessToken"
          | "terrainCesiumIonAsset"
          | "terrainCesiumIonUrl"
          | "terrainNormal"
        >,
      ) => Promise<TerrainProvider> | TerrainProvider | null);
} = {
  cesium: ({ terrainCesiumIonAccessToken, terrainNormal }) =>
    CesiumTerrainProvider.fromUrl(
      IonResource.fromAssetId(1, {
        accessToken: terrainCesiumIonAccessToken,
      }),
      {
        requestVertexNormals: terrainNormal,
        requestWaterMask: false,
      },
    ),
  arcgis: () =>
    ArcGISTiledElevationTerrainProvider.fromUrl(
      "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
    ),
  cesiumion: ({
    terrainCesiumIonAccessToken,
    terrainCesiumIonAsset,
    terrainCesiumIonUrl,
    terrainNormal,
  }) =>
    terrainCesiumIonAsset
      ? CesiumTerrainProvider.fromUrl(
          terrainCesiumIonUrl ||
            IonResource.fromAssetId(parseInt(terrainCesiumIonAsset, 10), {
              accessToken: terrainCesiumIonAccessToken,
            }),
          {
            requestVertexNormals: terrainNormal,
          },
        )
      : null,
};
