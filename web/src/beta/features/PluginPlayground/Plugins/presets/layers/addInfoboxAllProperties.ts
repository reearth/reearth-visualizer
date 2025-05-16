import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layers-add-infobox-all-properties-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: add-infobox-all-properties
name: Add Infobox All Properties
version: 1.0.0
extensions:
  - id: add-infobox-all-properties
    type: widget
    name: Add Infobox All Properties Widget
    description: Add Infobox All Properties Widget
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "add-infobox-all-properties",
  title: "add-infobox-all-properties.js",
  sourceCode: `// Japanese airport data(Only large and medium airports)
reearth.layers.add({
  type: "simple",
  data: {
    type: "geojson",
    url: "https://reearth.github.io/visualizer-plugin-sample-data/public/geojson/jp_airport.geojson",
  },
  // Display all attributes in the infobox
  infobox: {
    blocks: [
      {
        pluginId: "reearth",
        extensionId: "propertyInfoboxBetaBlock",
      },
    ],
  },
  marker: {},
});

// Move the camera to the position where the GeoJSON data is displayed.
reearth.camera.setView({
    "lat": 35.2963,
    "lng": 138.7982,
    "height": 380000,
    "heading": 0,
    "pitch": -1.37,
    "roll": 0
});

// data: Airports in Japan(Public Domain) https://data.humdata.org/dataset/ourairports-jpn
`
};

export const addInfoboxAllProperties: PluginType = {
  id: "add-infobox-all-properties",
  files: [yamlFile, widgetFile]
};
