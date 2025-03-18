import { FileType, PluginType } from "../../constants";

const yamlFile: FileType = {
  id: "layers-add-osm3d-tiles-reearth-yml",
  title: "reearth.yml",
  sourceCode: `id: layers-add-osm-3d-tiles-plugin
name: Add OSM 3D Tiles
version: 1.0.0
extensions:
  - id: layers-add-osm-3d-tiles
    type: widget
    name: Add OSM 3D Tiles
    description: Add OSM 3D Tiles
  `,
  disableEdit: true,
  disableDelete: true
};

const widgetFile: FileType = {
  id: "layers-add-osm-3d-tiles",
  title: "layers-add-osm-3d-tiles.js",
  sourceCode: `// Example of adding a layer with OSM 3D Tiles data

// Define OSM 3D Tiles
const layerOsm3dTiles = {
  type: "simple", // Required
  data: {
    type: "osm-buildings", // Data type
  },
};

// Add the OSM 3D Tiles layer from the URL to Re:Earth
// Documentation on Layers "add" event: https://visualizer.developer.reearth.io/plugin-api/layers/#add
reearth.layers.add(layerOsm3dTiles);

// Enable Terrain
// Documentation on Viewer "overrideProperty" event: https://visualizer.developer.reearth.io/plugin-api/viewer/#overrideproperty
reearth.viewer.overrideProperty({
  terrain: {
    enabled: true,
  },
});

// Move the camera to the position where the OSM 3D Tiles data is displayed.
// Documentation on Camera "flyTo" event: https://visualizer.developer.reearth.io/plugin-api/camera/#flyto
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
);
`
};

export const addOsm3dTiles: PluginType = {
  id: "add-osm-3d-tiles",
  files: [yamlFile, widgetFile]
};
