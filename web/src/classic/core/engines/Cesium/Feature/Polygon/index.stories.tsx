import { Meta, Story } from "@storybook/react";

import { engine } from "../..";
import Component, { Props } from "../../../../Map";

export default {
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<Props> = args => <Component {...args} />;

export const Basic = Template.bind([]);
Basic.args = {
  engine: "cesium",
  engines: {
    cesium: engine,
  },
  ready: true,
  layers: [
    {
      id: "l",
      type: "simple",
      data: {
        type: "geojson",
        value: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [0, 0],
                [0, 10],
                [10, 10],
                [10, 0],
                [0, 0],
              ],
              [
                [5, 5],
                [7, 5],
                [7, 7],
                [5, 7],
                [5, 5],
              ],
            ],
          },
        },
      },
      polygon: {
        stroke: true,
        strokeWidth: 10,
        strokeColor: "blue",
        fillColor: "red",
      },
    },
  ],
  property: {
    tiles: [
      {
        id: "default",
        tile_type: "default",
      },
    ],
  },
};

export const Excluded = Template.bind([]);
Excluded.args = {
  engine: "cesium",
  engines: {
    cesium: engine,
  },
  ready: true,
  layers: [
    {
      id: "l",
      type: "simple",
      data: {
        type: "geojson",
        value: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [0, 0],
                [0, 10],
                [10, 10],
                [10, 0],
                [0, 0],
              ],
              [
                [5, 5],
                [7, 5],
                [7, 7],
                [5, 7],
                [5, 5],
              ],
            ],
          },
        },
      },
      polygon: {
        stroke: true,
        strokeWidth: 10,
        strokeColor: "blue",
        fillColor: "red",
        extrudedHeight: 100000,
      },
    },
  ],
  property: {
    tiles: [
      {
        id: "default",
        tile_type: "default",
      },
    ],
  },
};

export const ClampToGround = Template.bind([]);
ClampToGround.args = {
  engine: "cesium",
  engines: {
    cesium: engine,
  },
  ready: true,
  layers: [
    {
      id: "l",
      type: "simple",
      data: {
        type: "geojson",
        value: {
          type: "Feature",
          properties: {},
          geometry: {
            coordinates: [
              [
                [137.74631070393525, 35.654778982881425],
                [137.74631070393525, 35.56614718408652],
                [137.81686198363366, 35.56614718408652],
                [137.81686198363366, 35.654778982881425],
                [137.74631070393525, 35.654778982881425],
              ],
            ],
            type: "Polygon",
          },
        },
      },
      polygon: {
        stroke: true,
        strokeWidth: 10,
        strokeColor: "blue",
        fillColor: "red",
        heightReference: "clamp",
      },
    },
  ],
  property: {
    tiles: [
      {
        id: "default",
        tile_type: "default",
      },
    ],
    terrain: {
      terrain: true,
      terrainType: "cesium",
      depthTestAgainstTerrain: true,
    },
  },
};
