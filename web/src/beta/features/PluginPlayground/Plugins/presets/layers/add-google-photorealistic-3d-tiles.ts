import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layers-add-googlePhotorealistic3dTiles-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: layers-add-googlePhotorealistic3dTiles-plugin
name: Add Google Photorealistic 3D Tiles
version: 1.0.0
extensions:
  - id: layers-add-googlePhotorealistic3dTiles
    type: widget
    name: Add Google Photorealistic 3D Tiles
    description: Add Google Photorealistic 3D Tiles
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "layers-add-googlePhotorealistic3dTiles",
  title: "layers-add-googlePhotorealistic3dTiles.js",
  sourceCode: `// Example of adding a layer with Google Photorealistic 3D Tiles

// Define Google Photorealistic 3D Tiles
const layerPhotorealistic3dTiles = {
  type: "simple", // Required
  data: {
    type: "google-photorealistic", // Data type
    serviceTokens: {
      googleMapApiKey: "put_your_api_key",
    },
  },
};

// Add the Google Photorealistic 3D Tiles layer to Re:Earth
reearth.layers.add(layerPhotorealistic3dTiles);

// Move the camera to the position where the Google Photorealistic 3D Tiles data is displayed.
reearth.camera.flyTo(
  // Define the camera position to be moved to
  {
    heading: 0.20219047310022553,
    height: 261.79910347824375,
    lat: 44.13880442335244,
    lng: 4.8038131598778,
    pitch: -0.5139201681525183,
    roll: 0.000011404713798235377,
  },
  // Define camera movement time
  {
    duration: 2.0,
  }
);`
};

export const addGooglePhotorealistic3dTiles: PluginType = {
  id: "add-googlePhotorealistic3dTiles",
  title: "Add Google Photorealistic 3D Tiles",
  files: [widgetFile, yamlFile]
};
