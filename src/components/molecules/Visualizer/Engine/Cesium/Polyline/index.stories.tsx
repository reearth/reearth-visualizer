import { Meta, Story } from "@storybook/react";
import React from "react";

import { V, location } from "../storybook";

import Polyline, { Props } from ".";

export default {
  title: "molecules/Visualizer/Engine/Cesium/Polyline",
  component: Polyline,
} as Meta;

export const Default: Story<Props> = args => (
  <V location={location}>
    <Polyline {...args} />
  </V>
);

Default.args = {
  layer: {
    id: "",
    property: {
      default: {
        strokeColor: "#ccaa",
        strokeWidth: 10,
        coordinates: [
          { lat: 35.652832, lng: 139.839478, height: 100 },
          { lat: 36.652832, lng: 140.039478, height: 100 },
          { lat: 34.652832, lng: 141.839478, height: 100 },
        ],
      },
    },
    isVisible: true,
  },
  isBuilt: false,
  isEditable: false,
  isSelected: false,
};
