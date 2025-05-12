import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layers-add-photogrammetric-3D-model-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: layers-add-photogrammetric-3D-model-plugin
name: Add Photogrammetric 3D model
version: 1.0.0
extensions:
  - id: layers-add-photogrammetric-3D-model
    type: widget
    name: Add Photogrammetric 3D model
    description: Add Photogrammetric 3D model
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "layers-add-photogrammetric-3D-model",
  title: "layers-add-photogrammetric-3D-model.js",
  sourceCode: `// Example of adding photogrammetric 3D model in the 3D Tiles format

// Define 3D Tiles
const photogrammetry = {
  type: "simple", // Required
  data: {
    type: "3dtiles",
    url: "https://reearth.github.io/visualizer-plugin-sample-data/public/3dtiles/theNaturalHistoryMuseumLondon/tileset.json", // URL of 3D Tiles
  },
  "3dtiles": {}, 
};

// Add the 3D Tiles layer from the URL to Re:Earth
// Documentation on Layers "add" event: https://visualizer.developer.reearth.io/plugin-api/layers/#add
reearth.layers.add(photogrammetry);

// Enable Terrain
// Documentation on Viewer "overrideProperty" event: https://visualizer.developer.reearth.io/plugin-api/viewer/#overrideproperty
reearth.viewer.overrideProperty({
  terrain: {
    enabled: true,
  },
});

// Move the camera to the position where the 3D model is displayed.
// Documentation on Camera "flyTo" event: https://visualizer.developer.reearth.io/plugin-api/camera/#flyto
reearth.camera.flyTo(
  // Define the camera position to be moved to
  {
    heading: 0.7083772524673009,
    height: 127.53844665380186,
    lat: 51.49650331659877,
    lng: -0.17778818741743166,
    pitch: -0.559655825180748,
    roll: 0.0000011257859080515686,
  },
  // Define camera movement time
  {
    duration: 2.0,
  }
);

// data:artfletch(CCBY4.0) https://sketchfab.com/3d-models/hintze-hall-45f5e56887f44075bbf283977c99541f`
};

export const addPhotogrammetric3dModel: PluginType = {
  id: "add-photogrammetric-3D-model",
  files: [yamlFile, widgetFile]
};
