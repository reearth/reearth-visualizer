import { action } from "@storybook/addon-actions";
import { Meta, StoryObj } from "@storybook/react";

import InsertionButton from ".";

export default {
  component: InsertionButton,
} as Meta;

type Story = StoryObj<typeof InsertionButton>;

export const Default: Story = {
  args: {
    onClick: action("onClick"),
  },
};
