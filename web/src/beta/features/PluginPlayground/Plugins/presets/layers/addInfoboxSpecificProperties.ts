import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layers-add-infobox-specific-properties-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: add-infobox-specific-properties
name: Add Infobox Specific Properties
version: 1.0.0
extensions:
  - id: add-infobox-specific-properties
    type: widget
    name: Add Infobox Specific Properties Widget
    description: Add Infobox Specific Properties Widget
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "add-infobox-specific-properties",
  title: "add-infobox-specific-properties.js",
  sourceCode: `// This example shows how to activate Infobox that display specific properties

// Japanese airport data(Only large and medium airports)
reearth.layers.add({
  type: "simple",
  data: {
    type: "geojson",
    url: "https://reearth.github.io/visualizer-plugin-sample-data/public/geojson/jp_airport.geojson",
  },
  // Display specific attributes in the infobox
  infobox: {
    blocks: [
      {
        pluginId: "reearth",
        extensionId: "propertyInfoboxBetaBlock",
        property: {
          default: {
            displayType: {
              value: "custom",
            },
            propertyList: {
              value: [
                {
                  key: "type",
                  value: "\${type}",
                },
                {
                  key: "name",
                  value: "\${name}",
                },
                {
                  key: "region_name",
                  value: "\${region_name}",
                },
                {
                  key: "iata_code",
                  value: "\${iata_code}",
                },
              ],
            },
          },
        },
      },
    ],
  },
  marker: {
    style: "image",
    image: "https://reearth.github.io/visualizer-plugin-sample-data/public/image/airport.svg",
    imageSize: 1.5,
  },
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

export const addInfoboxSpecificProperties: PluginType = {
  id: "add-infobox-specific-properties",
  files: [yamlFile, widgetFile]
};
