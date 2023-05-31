import { Meta, StoryObj } from "@storybook/react";

import TabButton from ".";

const meta: Meta<typeof TabButton> = {
  component: TabButton,
};

export default meta;

type Story = StoryObj<typeof TabButton>;

export const Clolse: Story = {
  args: {
    label: "Editor",
    disabled: true,
  },
};

export const Open: Story = {
  args: {
    label: "Editor",
    disabled: false,
  },
};
