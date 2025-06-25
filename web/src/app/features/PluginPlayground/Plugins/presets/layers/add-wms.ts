import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layers-add-wms-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: layers-add-wms-plugin
name: Add wms
version: 1.0.0
extensions:
  - id: layers-add-wms
    type: widget
    name: Add wms
    description: Add wms
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "layers-add-wms",
  title: "layers-add-wms.js",
  sourceCode: `// Define the WMS（Web Map Service）
const layerWmsUrl = {
  type: "simple", // Required
  data: {
    type: "wms", // Data type
    // URL of MWS（This data shows Human_Footprint 1995-2004 provided by NASA）
    url: "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi",
    // Define layer name of WMS
    layers: ["Human_Footprint_1995-2004"],
  },
};

// Add the WMS layer from the URL to Re:Earth
// Documentation on Layers "add" event: https://visualizer.developer.reearth.io/plugin-api/layers/#add
reearth.layers.add(layerWmsUrl);

//WMS data is provided by NASA GIBS（https://www.earthdata.nasa.gov/engage/open-data-services-software/earthdata-developer-portal/gibs-api)`
};

export const addWms: PluginType = {
  id: "add-wms",
  files: [yamlFile, widgetFile]
};
