import { Meta, Story } from "@storybook/react";

import { V, location } from "../storybook";

import Box, { Props } from ".";

export default {
  title: "molecules/Visualizer/Engine/Cesium/Box",
  component: Box,
} as Meta;

export const Default: Story<Props> = args => (
  <V location={location}>
    <Box {...args} />
  </V>
);

Default.args = {
  layer: {
    id: "",
    property: {
      default: {
        fillColor: "rgba(0, 0, 0, 0.5)",
        location,
        width: 1000,
        length: 1000,
        height: 1000,
      },
    },
    isVisible: true,
  },
};
