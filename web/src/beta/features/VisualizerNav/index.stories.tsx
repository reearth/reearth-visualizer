import { Meta, StoryObj } from "@storybook/react";
import { ComponentProps } from "react";

import Component from ".";

export default {
  component: Component,
} as Meta<ComponentProps<typeof Component>>;

export const Default: StoryObj<typeof Component> = {
  args: {},
};
