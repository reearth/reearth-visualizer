import { Meta, Story } from "@storybook/react";
import React from "react";

import { V, location, SceneProperty } from "../storybook";

import Component, { Props } from ".";

export default {
  title: "molecules/Visualizer/Engine/Cesium/Model",
  component: Component,
} as Meta;

const Template: Story<Props & { sceneProperty?: SceneProperty }> = args => (
  <V property={args.sceneProperty}>
    <Component {...args} />
  </V>
);

export const Default = Template.bind({});
Default.args = {
  ...Template.args,
  sceneProperty: {
    timeline: {
      animation: true,
    },
  },
  primitive: {
    id: "",
    isVisible: true,
    property: {
      default: {
        location,
        scale: 1000,
        heading: 130,
        model: `${process.env.PUBLIC_URL}/BoxAnimated.glb`,
      },
    },
  },
};

export const Appearance = Template.bind({});
Appearance.args = {
  ...Template.args,
  sceneProperty: {
    atmosphere: {
      enable_shadows: true,
    },
  },
  primitive: {
    id: "",
    isVisible: true,
    property: {
      default: {
        location,
        scale: 1000,
        model: `${process.env.PUBLIC_URL}/BoxAnimated.glb`,
        animation: false,
      },
      appearance: {
        shadows: "enabled",
        color: "red",
        colorBlend: "mix",
        colorBlendAmount: 0.5,
        silhouette: true,
        silhouetteColor: "yellow",
        silhouetteSize: 10,
      },
    },
  },
};
