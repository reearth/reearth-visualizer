import { DatasetFormat } from "@reearth/services/plateau/graphql/types/catalog";

export const toDataType = (format: DatasetFormat) => {
  switch (format) {
    case DatasetFormat.Geojson:
      return "geojson";
    case DatasetFormat.Cesium3Dtiles:
      return "3dtiles";
    case DatasetFormat.Mvt:
      return "mvt";
    case DatasetFormat.Csv:
      return "csv";
    case DatasetFormat.Czml:
      return "czml";
    case DatasetFormat.Wms:
      return "wms";
    case DatasetFormat.Gltf:
    case DatasetFormat.GtfsRealtime:
      return "gltf";
    case DatasetFormat.Tms:
      return "tms";
    case DatasetFormat.Tiles:
      return "tiles";
    default:
      return "";
  }
};
