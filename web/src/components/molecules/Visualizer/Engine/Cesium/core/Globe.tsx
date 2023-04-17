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

import { objKeys } from "@reearth/util/util";

import type { SceneProperty, TerrainProperty } from "../../ref";

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

  const terrainProvider = useMemo((): TerrainProvider | undefined => {
    const opts = {
      terrain: terrainProperty?.terrain,
      terrainType: terrainProperty?.terrainType,
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
    cesiumIonAccessToken,
  ]);

  return (
    <CesiumGlobe
      enableLighting={!!property?.atmosphere?.enable_lighting}
      showGroundAtmosphere={property?.atmosphere?.ground_atmosphere ?? true}
      atmosphereSaturationShift={property?.atmosphere?.surturation_shift}
      atmosphereHueShift={property?.atmosphere?.hue_shift}
      atmosphereBrightnessShift={property?.atmosphere?.brightness_shift}
      terrainProvider={terrainProvider}
      depthTestAgainstTerrain={!!terrainProperty.depthTestAgainstTerrain}
      terrainExaggerationRelativeHeight={terrainProperty.terrainExaggerationRelativeHeight}
      terrainExaggeration={terrainProperty.terrainExaggeration}
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
          "terrainCesiumIonAccessToken" | "terrainCesiumIonAsset" | "terrainCesiumIonUrl"
        >,
      ) => TerrainProvider | null);
} = {
  cesium: ({ terrainCesiumIonAccessToken }) =>
    // https://github.com/CesiumGS/cesium/blob/main/Source/Core/createWorldTerrain.js
    new CesiumTerrainProvider({
      url: IonResource.fromAssetId(1, {
        accessToken: terrainCesiumIonAccessToken,
      }),
      requestVertexNormals: false,
      requestWaterMask: false,
    }),
  arcgis: () =>
    new ArcGISTiledElevationTerrainProvider({
      url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
    }),
  cesiumion: ({ terrainCesiumIonAccessToken, terrainCesiumIonAsset, terrainCesiumIonUrl }) =>
    terrainCesiumIonAsset
      ? new CesiumTerrainProvider({
          url:
            terrainCesiumIonUrl ||
            IonResource.fromAssetId(parseInt(terrainCesiumIonAsset, 10), {
              accessToken: terrainCesiumIonAccessToken,
            }),
          requestVertexNormals: true,
        })
      : null,
};
