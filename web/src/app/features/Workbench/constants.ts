import type { Layer } from "@reearth/core";

export const DEFAULT_WORKBENCH_LAYERS: Layer[] = [
  {
    type: "simple",
    id: "workbench-sample-points",
    title: "Sample Points",
    visible: true,
    data: {
      type: "geojson",
      value: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [139.7671, 35.6812] },
            properties: {
              title: "Tokyo Station",
              description: "Sample point for plugin development."
            }
          },
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [139.7454, 35.6586] },
            properties: {
              title: "Tokyo Tower",
              description: "Sample point for plugin development."
            }
          }
        ]
      }
    }
  }
];
