import { Meta, StoryObj } from "@storybook/react";

import Component from ".";

const meta: Meta<typeof Component> = {
  component: Component,
};

export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {
  args: {
    layers: [
      { label: "Landmark", visible: true },
      { label: "takanwa_Street.json" },
      { label: "people_animation" },
    ],
  },
};

export const Empty: Story = {
  args: {
    layers: [],
  },
};
