import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layers-add-google-photorealistic-3d-tiles-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: layers-add-google-photorealistic-3d-tiles-plugin
name: Add Google Photorealistic 3D Tiles
version: 1.0.0
extensions:
  - id: layers-add-google-photorealistic-3d-tiles
    type: widget
    name: Add Google Photorealistic 3D Tiles
    description: Add Google Photorealistic 3D Tiles
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "layers-add-google-photorealistic-3d-tiles",
  title: "layers-add-google-photorealistic-3d-tiles.js",
  sourceCode: `// Example of adding a layer with Google Photorealistic 3D Tiles

// Define Google Photorealistic 3D Tiles
const layerPhotorealistic3dTiles = {
  type: "simple", // Required
  data: {
    type: "google-photorealistic", // Data type
    serviceTokens: {
      googleMapApiKey: "put_your_api_key", 
      // This document explains how to create Photorealistic 3D Tiles API key. 
      // For more information on obtaining an API key, visit:
      // https://developers.google.com/maps/documentation/tile/get-api-key
    },
  },
};

// Add the Google Photorealistic 3D Tiles layer to Re:Earth
// Documentation on Layers "add" event: https://visualizer.developer.reearth.io/plugin-api/layers/#add
reearth.layers.add(layerPhotorealistic3dTiles);

// Move the camera to the position where the Google Photorealistic 3D Tiles data is displayed.
// Documentation on Camera "flyTo" event: https://visualizer.developer.reearth.io/plugin-api/camera/#flyto
reearth.camera.flyTo(
  // Define the camera position to be moved to
  {
    heading: 6.0671039802577384,
    height: 1128.5794476956557,
    lat: 40.730278427281455,
    lng: -73.97291848442529,
    pitch: -0.31010069674839325,
    roll: 0.00004250447889830866,
  },
  // Define camera movement time
  {
    duration: 2.0,
  }
);`
};

export const addGooglePhotorealistic3dTiles: PluginType = {
  id: "add-google-photorealistic-3d-tiles",
  files: [yamlFile, widgetFile]
};
