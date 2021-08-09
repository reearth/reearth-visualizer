import React from "react";
import { Meta, Story } from "@storybook/react";

import { Cartesian3, Color } from "cesium";
import { Entity } from "resium";
import Component, { Props } from ".";

export default {
  title: "molecules/Visualizer/Engine/Cesium",
  component: Component,
  argTypes: {
    onCameraChange: { action: "onCameraChange" },
    onPrimitiveSelect: { action: "onPrimitiveSelect" },
  },
} as Meta;

const Template: Story<Props> = args => <Component {...args} />;

export const Default = Template.bind([]);
Default.args = {
  isBuilt: false,
  isEditable: false,
  small: false,
  ready: true,
  selectedPrimitiveId: undefined,
  property: {
    default: {
      terrain: true,
      terrainExaggeration: 10,
      bgcolor: "#ff0",
      skybox: false,
    },
    tiles: [{ id: "default", tile_type: "default" }],
    atmosphere: {
      enable_lighting: true,
      enable_sun: true,
      sky_atmosphere: true,
      ground_atmosphere: true,
    },
  },
};

export const Selected = Template.bind([]);
Selected.args = {
  ...Default.args,
  children: (
    <Entity
      id="a"
      point={{ color: Color.WHITE, pixelSize: 10 }}
      position={Cartesian3.fromDegrees(0, 0, 0)}
      selected
    />
  ),
  selectedPrimitiveId: "a",
};

export const DefaultCamera = Template.bind({});
DefaultCamera.args = {
  ...Default.args,
  camera: {
    fov: 1.0471975511965976,
    heading: 0.23410230091957818,
    height: 21075.98272847632,
    lat: 36.382785984750846,
    lng: 139.59084714252558,
    pitch: 0,
    roll: 0,
  },
};

export const InitialCamera = Template.bind({});
InitialCamera.args = {
  ...Default.args,
  property: {
    ...Default.args.property,
    default: {
      ...Default.args.property?.default,
      camera: {
        fov: 1.0471975511965976,
        heading: 0.23410230091957818,
        height: 21075.98272847632,
        lat: 36.382785984750846,
        lng: 139.59084714252558,
        pitch: 0,
        roll: 0,
      },
    },
  },
};
