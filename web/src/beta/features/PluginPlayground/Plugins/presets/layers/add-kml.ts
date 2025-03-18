import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layers-add-kml-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: layers-add-kml-plugin
name: Add KML
version: 1.0.0
extensions:
  - id: layers-add-kml
    type: widget
    name: Add KML
    description: Add KML
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "layers-add-kml",
  title: "layers-add-kml.js",
  sourceCode: `// Example of adding a layer with KML data

// Define the KML as a normal string
const kmlData = \`<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Placemark>
    <name>Polygon</name>
    <Polygon>
      <outerBoundaryIs>
        <LinearRing>
          <coordinates>
            -84.69104794134181,55.71976583858575,0
            -50.21926684954955,54.914116182535565,0
            -59.0296334789341,10.029277658732568,0
            -79.10835968601603,10.498477077010023,0
            -84.69104794134181,55.71976583858575,0
          </coordinates>
        </LinearRing>
      </outerBoundaryIs>
    </Polygon>
  </Placemark>
</kml>\`;

// Encode the KML string and set the data URI scheme
const encodedKml = "data:text/plain;charset=UTF-8," + encodeURIComponent(kmlData);

// Define layers using encoded KML
const layerKmlEncoded = {
  type: "simple", // Required
  data: {
    type: "kml", // Data format
    url: encodedKml, // Use the encoded KML string as a data URI
  },
  polygon: { // Write the features style
    fillColor: "red",
  },
};

// Define the KML with URL
const layerKmlUrl = {
  type: "simple", 
  data: {
    type: "kml", 
    url: "https://reearth.github.io/visualizer-plugin-sample-data/public/kml/square.kml", // URL of KML file
  },
  polygon: {}
};

// Add the encoded KML layer to Re:Earth
// Documentation on Layers "add" event: https://visualizer.developer.reearth.io/plugin-api/layers/#add
reearth.layers.add(layerKmlEncoded);

// Add the KML layer from the URL to Re:Earth
reearth.layers.add(layerKmlUrl);`
};

export const addKml: PluginType = {
  id: "add-kml",
  files: [yamlFile, widgetFile]
};
