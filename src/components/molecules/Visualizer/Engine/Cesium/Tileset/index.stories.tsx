import { Meta, Story } from "@storybook/react";

import { V } from "../storybook";

import Component, { Props } from ".";

export default {
  title: "molecules/Visualizer/Engine/Cesium/Tileset",
  component: Component,
} as Meta;

const Template: Story<Props> = args => {
  return (
    <V lookAt={{ lng: -75.61209430779367, lat: 40.05083633101078, height: 0, range: 1200 }}>
      <Component {...args} />
    </V>
  );
};

export const Default = Template.bind({});
Default.args = {
  ...Template.args,
  layer: {
    id: "",
    isVisible: true,
    property: {
      default: {
        tileset: `${process.env.PUBLIC_URL}/tileset/tileset.json`,
      },
    },
  },
};
