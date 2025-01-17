import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layers-add-czml-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: layers-add-czml-plugin
name: Add CZML
version: 1.0.0
extensions:
  - id: layers-add-czml
    type: widget
    name: Add CZML
    description: Add CZML
    widgetLayout:
      defaultLocation:
        zone: outer
        section: left
        area: top
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "layers-add-czml",
  title: "layers-add-czml.js",
  sourceCode: `// Example of adding a layer with CZML data

// Difine encoded CZML in a variable
const encodedCzml =
  "data:text/plain;charset=UTF-8,%5B%0A%20%20%7B%0A%20%20%20%20%22id%22%3A%20%22document%22%2C%0A%20%20%20%20%22name%22%3A%20%222D%20Polygon%20Example%22%2C%0A%20%20%20%20%22version%22%3A%20%221.0%22%0A%20%20%7D%2C%0A%20%20%7B%0A%20%20%20%20%22id%22%3A%20%22polygon%22%2C%0A%20%20%20%20%22name%22%3A%20%22Polygon%20Example%22%2C%0A%20%20%20%20%22polygon%22%3A%20%7B%0A%20%20%20%20%20%20%22positions%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%22cartographicDegrees%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%20%20-95.19644404998762%2C%0A%20%20%20%20%20%20%20%20%20%2039.121855688403606%2C%0A%20%20%20%20%20%20%20%20%20%200%2C%0A%20%20%20%20%20%20%20%20%20%20-95.86066795468007%2C%0A%20%20%20%20%20%20%20%20%20%2030.135315689161864%2C%0A%20%20%20%20%20%20%20%20%20%200%2C%0A%20%20%20%20%20%20%20%20%20%20-84.60676001423798%2C%0A%20%20%20%20%20%20%20%20%20%2029.013591974308632%2C%0A%20%20%20%20%20%20%20%20%20%200%2C%0A%20%20%20%20%20%20%20%20%20%20-82.7088322952643%2C%0A%20%20%20%20%20%20%20%20%20%2037.87660535441917%2C%0A%20%20%20%20%20%20%20%20%20%200%2C%0A%20%20%20%20%20%20%20%20%20%20-95.19644404998762%2C%0A%20%20%20%20%20%20%20%20%20%2039.121855688403606%2C%0A%20%20%20%20%20%20%20%20%20%200%0A%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%22extrudedHeight%22%3A%20300000%0A%20%20%20%20%7D%0A%20%20%7D%0A%5D%0A";

// Define layers using encoded CZML
const layerCzmlEncoded = {
  type: "simple", // Required
  data: {
    type: "czml", // Write the data format
    url: encodedCzml,
  },
  // Write the feattures style
  polygon: { 
    fillColor: "red",
  },
};

// Difine the CZML with URL
const layerCzmlUrl = {
  type: "simple", 
  data: {
    type: "czml", 
    url: "https://reearth.github.io/visualizer-plugin-sample-data/public/czml/square_3d_polygon.czml", // URL of CZML file
  },
};

// Add the encoded CZML layer to Re:Earth
reearth.layers.add(layerCzmlEncoded);

// Add the CZML layer from the URL to Re:Earth
reearth.layers.add(layerCzmlUrl);

// Move the camera to the position where the CZML data is displayed.
reearth.camera.flyTo(
  // Define the camera position to be moved to
  {
    lng: -88.93602871895675,
    lat: 15.453904059215354,
    height: 2479417.0253900583,
    heading: 5.949278757227463,
    pitch: -0.8795938234403176,
    roll: 0.0004975556834603267,
  },
  // Define camera movement time
  {
    duration: 2.0,
  }
);`
};

export const addCzml: PluginType = {
  id: "add-czml",
  title: "Add CZML",
  files: [widgetFile, yamlFile]
};
