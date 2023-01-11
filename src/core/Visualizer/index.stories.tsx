import { Meta, Story } from "@storybook/react";

import Component, { Props } from ".";

export default {
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<Props> = args => <Component {...args} />;

export const Cesium = Template.bind({});

Cesium.args = {
  engine: "cesium",
};
