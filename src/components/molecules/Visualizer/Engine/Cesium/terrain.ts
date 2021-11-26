import {
  ArcGISTiledElevationTerrainProvider,
  EllipsoidTerrainProvider,
  createWorldTerrain,
} from "cesium";

export default {
  default: new EllipsoidTerrainProvider(),
  cesium: createWorldTerrain(),
  arcgis: new ArcGISTiledElevationTerrainProvider({
    url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
  }),
};
