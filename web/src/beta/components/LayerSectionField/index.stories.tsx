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
      { id: "0", label: "Landmark", visible: true },
      { id: "1", label: "takanwa_Street.json" },
      { id: "2", label: "people_animation", active: true },
    ],
  },
};

export const Empty: Story = {
  args: {
    layers: [],
  },
};
