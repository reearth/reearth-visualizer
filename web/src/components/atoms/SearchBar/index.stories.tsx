import { Meta, Story } from "@storybook/react";

import Component, { Props } from ".";

export default {
  title: "atoms/SearchBar",
  component: Component,
} as Meta;

export const Default: Story<Props> = args => <Component {...args} />;

Default.args = {
  iconPos: "right",
  placeHolder: "search plugins",
};
