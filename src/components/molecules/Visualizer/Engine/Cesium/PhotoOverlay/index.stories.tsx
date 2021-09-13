import { Meta, Story } from "@storybook/react";
import { Math as CesiumMath } from "cesium";
import React from "react";

import { V, location } from "../storybook";

import PhotoOverlay, { Props } from ".";

export default {
  title: "molecules/Visualizer/Engine/Cesium/PhotoOverlay",
  component: PhotoOverlay,
} as Meta;

const Template: Story<Props> = args => (
  <V location={location}>
    <PhotoOverlay {...args} />
  </V>
);

export const Default = Template.bind({});
Default.args = {
  primitive: {
    id: "",
    isVisible: true,
    property: {
      default: {
        location,
        photoOverlayImage: `${process.env.PUBLIC_URL}/sample.svg`,
        camera: {
          ...location,
          fov: CesiumMath.toRadians(30),
          heading: 0,
          pitch: 0,
          roll: 0,
        },
      },
    },
  },
  isBuilt: false,
  isEditable: false,
  isSelected: false,
};

export const Selected = Template.bind({});
Selected.args = {
  primitive: {
    id: "",
    isVisible: true,
    property: {
      default: {
        location,
        photoOverlayImage: `${process.env.PUBLIC_URL}/sample.svg`,
        camera: {
          ...location,
          fov: CesiumMath.toRadians(30),
          heading: 0,
          pitch: 0,
          roll: 0,
        },
      },
    },
  },
  isBuilt: false,
  isEditable: false,
  isSelected: true,
};
