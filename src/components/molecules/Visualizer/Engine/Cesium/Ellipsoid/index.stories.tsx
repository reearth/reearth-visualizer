import { Meta, Story } from "@storybook/react";
import React from "react";

import { V, location } from "../storybook";

import Ellipsoid, { Props } from ".";

export default {
  title: "molecules/Visualizer/Engine/Cesium/Ellipsoid",
  component: Ellipsoid,
} as Meta;

export const Default: Story<Props> = args => (
  <V location={location}>
    <Ellipsoid {...args} />
  </V>
);

Default.args = {
  layer: {
    id: "",
    property: {
      default: {
        radius: 1000,
        fillColor: "#f00a",
        position: location,
        height: location.height,
      },
    },
    isVisible: true,
  },
};
