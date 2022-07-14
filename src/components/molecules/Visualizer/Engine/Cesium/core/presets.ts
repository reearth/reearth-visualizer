import {
  ImageryProvider,
  ArcGisMapServerImageryProvider,
  IonImageryProvider,
  OpenStreetMapImageryProvider,
  IonWorldImageryStyle,
  UrlTemplateImageryProvider,
  Ion,
} from "cesium";

export const tiles = {
  default: () =>
    new IonImageryProvider({
      assetId: IonWorldImageryStyle.AERIAL,
      accessToken: Ion.defaultAccessToken,
    }),
  default_label: () =>
    new IonImageryProvider({
      assetId: IonWorldImageryStyle.AERIAL_WITH_LABELS,
      accessToken: Ion.defaultAccessToken,
    }),
  default_road: () =>
    new IonImageryProvider({
      assetId: IonWorldImageryStyle.ROAD,
      accessToken: Ion.defaultAccessToken,
    }),
  stamen_watercolor: () =>
    new OpenStreetMapImageryProvider({
      url: "https://stamen-tiles.a.ssl.fastly.net/watercolor/",
      credit: "Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under CC BY SA.",
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
  black_marble: () =>
    new IonImageryProvider({ assetId: 3812, accessToken: Ion.defaultAccessToken }),
  japan_gsi_standard: () =>
    new OpenStreetMapImageryProvider({
      url: "https://cyberjapandata.gsi.go.jp/xyz/std/",
    }),
  url: url => (url ? new UrlTemplateImageryProvider({ url }) : null),
} as { [key: string]: (url?: string) => ImageryProvider | null };
