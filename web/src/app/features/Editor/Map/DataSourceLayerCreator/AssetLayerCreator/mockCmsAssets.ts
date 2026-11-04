// TODO: remove once CMS is connected. Placeholder data so the CMS tabs'
// Project / Model columns can be previewed.
import { AssetSource, LayerAsset } from "./types";

const mock = (
  id: string,
  name: string,
  ext: string,
  projectName: string,
  modelName: string,
  size: number,
  createdAt: string
): LayerAsset => ({
  id: `cms-${id}`,
  workspaceId: "",
  name: `${name}.${ext}`,
  size,
  url: `https://example.com/cms/${name}.${ext}`,
  createdAt: new Date(createdAt),
  contentType: "",
  projectName,
  modelName,
  modelUrl: `https://example.com/cms/models/${id}`
});

const MOCK_CMS_ASSETS: LayerAsset[] = [
  mock(
    "1",
    "active_volcanoes",
    "geojson",
    "Active Volcanoes Project",
    "Model",
    91115,
    "2023-04-19T11:28"
  ),
  mock(
    "2",
    "japan_architecture",
    "csv",
    "Urban Development Initiative",
    "Skyline Model",
    2877,
    "2023-02-22T15:24"
  ),
  mock(
    "3",
    "kumagaya-shi-beta",
    "geojson",
    "Mountain Range Visualization",
    "Urban Landscape Model",
    1447034,
    "2023-04-19T11:28"
  ),
  mock(
    "4",
    "kumagaya-shi-alpha",
    "kml",
    "Desert Terrain Analysis",
    "Forest Canopy Model",
    1447034,
    "2023-04-19T11:28"
  ),
  mock(
    "5",
    "neighborhood_data",
    "geojson",
    "Meteorological Patterns Study",
    "Desert Terrain Model",
    460800,
    "2023-03-15T12:45"
  ),
  mock(
    "6",
    "weather_patterns",
    "csv",
    "Historical Ruins Mapping",
    "River Delta Model",
    1310720,
    "2023-05-01T09:30"
  ),
  mock(
    "7",
    "eruption_timeline",
    "czml",
    "Volcanic Eruption Simulation",
    "Volcanic Eruption Model",
    87552,
    "2023-06-10T14:00"
  ),
  mock(
    "8",
    "traffic_flow_with_a_very_long_file_name",
    "geojson",
    "Traffic Flow Analysis With A Very Long Project Name",
    "Historical Ruins Model With A Long Name",
    2464153,
    "2023-07-20T08:15"
  ),
  // Formats CMS states explicitly, since the URL doesn't tell them apart.
  {
    ...mock(
      "9",
      "building_footprints",
      "mvt",
      "Urban Development Initiative",
      "Building Footprints Model",
      5242880,
      "2023-08-02T10:00"
    ),
    format: "mvt",
    url: "https://example.com/cms/building_footprints/{z}/{x}/{y}.mvt"
  },
  {
    ...mock(
      "10",
      "land_use",
      "wms",
      "Desert Terrain Analysis",
      "Land Use Model",
      0,
      "2023-08-15T16:20"
    ),
    format: "wms",
    // No LAYERS parameter, so the layer names must be entered.
    url: "https://example.com/cms/wms"
  },
  {
    ...mock(
      "11",
      "city_buildings",
      "3dtiles",
      "Skyline Architecture Model",
      "City Buildings Model",
      104857600,
      "2023-09-01T09:45"
    ),
    format: "3dtiles",
    url: "https://example.com/cms/city_buildings/tileset.json"
  }
];

export const MOCK_CMS_SOURCE: AssetSource = {
  assets: MOCK_CMS_ASSETS,
  loading: false,
  loadMore: () => undefined
};
