import { Meta, Story } from "@storybook/react";

import { engine } from "../..";
import Component, { Props } from "../../../../Map";

export default {
  title: "core/engines/Cesium/Feature/Raster",
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<Props> = args => <Component {...args} />;

export const WMS = Template.bind([]);
WMS.args = {
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
        type: "wms",
        url: "https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi",
        layers: "IMERG_Precipitation_Rate",
      },
      raster: {
        maximumLevel: 100,
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

export const MVT = Template.bind([]);
MVT.args = {
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
        type: "mvt",
        url: "https://example.com/exmaple.mvt", // You need to set MVT URL.
        layers: "road",
      },
      polygon: {
        fillColor: "white",
        strokeColor: "white",
        strokeWidth: 1,
        lineJoin: "round",
      },
      raster: {},
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
