import { Meta, Story } from "@storybook/react";
import React from "react";

import Component, { Props } from ".";

export default {
  title: "molecules/EarthEditor/PropertyPane/WidgetToggleSwitch",
  component: Component,
} as Meta;

export const Default: Story<Props> = args => <Component {...args} />;

Default.args = {
  checked: false,
};
