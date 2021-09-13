import { Meta, Story } from "@storybook/react";
import React from "react";

import Component, { Props } from ".";

export default {
  title: "atoms/SelectBox",
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

export const Default: Story<Props> = args => <Component {...args} />;

Default.args = {
  selected: "a",
  items: [
    { key: "a", label: "A" },
    { key: "b", label: "B" },
  ],
};
