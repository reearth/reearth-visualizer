import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layers-add-kml-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: layers-add-kml-plugin
name: Add CZML
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

// Define encoded KML in a variable
const encodedKml =
  "data:text/plain;charset=UTF-8,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%0A%3Ckml%20xmlns%3D%22http%3A%2F%2Fwww.opengis.net%2Fkml%2F2.2%22%3E%0A%20%20%3CPlacemark%3E%0A%20%20%20%20%3Cname%3EPolygon%3C%2Fname%3E%0A%20%20%20%20%3CPolygon%3E%0A%20%20%20%20%20%20%3CouterBoundaryIs%3E%0A%20%20%20%20%20%20%20%20%3CLinearRing%3E%0A%20%20%20%20%20%20%20%20%20%20%3Ccoordinates%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20-84.69104794134181%2C55.71976583858575%2C0%0A%20%20%20%20%20%20%20%20%20%20%20%20-50.21926684954955%2C54.914116182535565%2C0%0A%20%20%20%20%20%20%20%20%20%20%20%20-59.0296334789341%2C10.029277658732568%2C0%0A%20%20%20%20%20%20%20%20%20%20%20%20-79.10835968601603%2C10.498477077010023%2C0%0A%20%20%20%20%20%20%20%20%20%20%20%20-84.69104794134181%2C55.71976583858575%2C0%0A%20%20%20%20%20%20%20%20%20%20%3C%2Fcoordinates%3E%0A%20%20%20%20%20%20%20%20%3C%2FLinearRing%3E%0A%20%20%20%20%20%20%3C%2FouterBoundaryIs%3E%0A%20%20%20%20%3C%2FPolygon%3E%0A%20%20%3C%2FPlacemark%3E%0A%3C%2Fkml%3E";

// Define layers using encoded CZML
const layerKmlEncoded = {
  type: "simple", // Required
  data: {
    type: "kml", // Write the data format
    url: encodedKml,
  },
  polygon: { // Write the feattures style
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
};

// Add the encoded KML layer to Re:Earth
reearth.layers.add(layerKmlEncoded);

// Add the KML layer from the URL to Re:Earth
reearth.layers.add(layerKmlUrl);`
};

export const addKml: PluginType = {
  id: "add-kml",
  title: "Add KML",
  files: [widgetFile, yamlFile]
};
