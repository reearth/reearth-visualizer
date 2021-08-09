import React from "react";
import { Meta, Story } from "@storybook/react";
import { V, location } from "../storybook";
import Polygon, { Props } from ".";

export default {
  title: "molecules/Visualizer/Engine/Cesium/Polygon",
  component: Polygon,
} as Meta;

export const Default: Story<Props> = args => (
  <V location={location}>
    <Polygon {...args} />
  </V>
);

Default.args = {
  primitive: {
    id: "",
    property: {
      default: {
        fill: true,
        fillColor: "#ffffffaa",
        stroke: true,
        strokeColor: "red",
        strokeWidth: 10,
        polygon: [
          [
            { lat: 35.652832, lng: 139.839478, height: 100 },
            { lat: 36.652832, lng: 140.039478, height: 100 },
            { lat: 34.652832, lng: 141.839478, height: 100 },
          ],
        ],
      },
    },
    isVisible: true,
  },
  isBuilt: false,
  isEditable: false,
  isSelected: false,
};
