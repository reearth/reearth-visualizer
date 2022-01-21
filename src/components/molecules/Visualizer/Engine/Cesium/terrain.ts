import {
  ArcGISTiledElevationTerrainProvider,
  EllipsoidTerrainProvider,
  IonResource,
  CesiumTerrainProvider,
  Ion,
} from "cesium";

export default {
  default: new EllipsoidTerrainProvider(),
  cesium: () =>
    // https://github.com/CesiumGS/cesium/blob/main/Source/Core/createWorldTerrain.js
    new CesiumTerrainProvider({
      url: IonResource.fromAssetId(1, { accessToken: Ion.defaultAccessToken }),
      requestVertexNormals: false,
      requestWaterMask: false,
    }),
  arcgis: new ArcGISTiledElevationTerrainProvider({
    url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
  }),
};
