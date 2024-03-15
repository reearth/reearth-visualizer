import { WebMercatorTilingScheme } from "@cesium/engine";
import {
  ImageryProvider,
  ArcGisMapServerImageryProvider,
  IonImageryProvider,
  OpenStreetMapImageryProvider,
  IonWorldImageryStyle,
  UrlTemplateImageryProvider,
  DiscardEmptyTileImagePolicy,
} from "cesium";

import { JapanGSIOptimalBVmapLabelImageryProvider } from "./labels/JapanGSIOptimalBVmapVectorMapLabel/JapanGSIOptimalBVmapLabelImageryProvider";

export const tiles = {
  default: ({ cesiumIonAccessToken } = {}) =>
    new IonImageryProvider({
      assetId: IonWorldImageryStyle.AERIAL,
      accessToken: cesiumIonAccessToken,
    }),
  default_label: ({ cesiumIonAccessToken } = {}) =>
    new IonImageryProvider({
      assetId: IonWorldImageryStyle.AERIAL_WITH_LABELS,
      accessToken: cesiumIonAccessToken,
    }),
  default_road: ({ cesiumIonAccessToken } = {}) =>
    new IonImageryProvider({
      assetId: IonWorldImageryStyle.ROAD,
      accessToken: cesiumIonAccessToken,
    }),
  stamen_watercolor: () =>
    new OpenStreetMapImageryProvider({
      url: "https://stamen-tiles.a.ssl.fastly.net/watercolor/",
      credit: "Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under CC BY SA.",
      fileExtension: "jpg",
    }),
  stamen_toner: () =>
    new OpenStreetMapImageryProvider({
      url: "https://stamen-tiles.a.ssl.fastly.net/toner/",
      credit: "Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under CC BY SA.",
    }),
  open_street_map: () =>
    new OpenStreetMapImageryProvider({
      url: "https://a.tile.openstreetmap.org/",
      credit:
        "Copyright: Tiles © Esri — Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
    }),
  esri_world_topo: () =>
    new ArcGisMapServerImageryProvider({
      url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer",
      credit:
        "Copyright: Tiles © Esri — Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Communit",
      enablePickFeatures: false,
    }),
  black_marble: ({ cesiumIonAccessToken } = {}) =>
    new IonImageryProvider({ assetId: 3812, accessToken: cesiumIonAccessToken }),
  japan_gsi_standard: () =>
    new OpenStreetMapImageryProvider({
      url: "https://cyberjapandata.gsi.go.jp/xyz/std/",
    }),
  url: ({ url, heatmap, tile_zoomLevel } = {}) =>
    url
      ? new UrlTemplateImageryProvider({
          url,
          tileDiscardPolicy: heatmap ? new DiscardEmptyTileImagePolicy() : undefined,
          minimumLevel: tile_zoomLevel?.[0],
          maximumLevel: tile_zoomLevel?.[1],
        })
      : null,
} as {
  [key: string]: (opts?: {
    url?: string;
    cesiumIonAccessToken?: string;
    heatmap?: boolean;
    tile_zoomLevel?: number[];
  }) => ImageryProvider | null;
};

export const labelTiles = {
  japan_gsi_optimal_bvmap: (params: {
    url: string;
    minimumLevel?: number;
    maximumLevel?: number;
    minimumDataLevel: number;
    maximumDataLevel: number;
  }) =>
    new JapanGSIOptimalBVmapLabelImageryProvider({
      url: params.url,
      tilingScheme: new WebMercatorTilingScheme(),
      tileWidth: 256,
      tileHeight: 256,
      minimumDataLevel: params.minimumDataLevel,
      maximumDataLevel: params.maximumDataLevel,
    }),
};
