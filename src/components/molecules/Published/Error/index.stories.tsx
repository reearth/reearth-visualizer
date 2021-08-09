import React from "react";
import { Meta, Story } from "@storybook/react";

import Component from ".";

export default {
  title: "molecules/Published/Error",
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story = args => <Component {...args} />;

export const Default = Template.bind({});
Default.args = {};
