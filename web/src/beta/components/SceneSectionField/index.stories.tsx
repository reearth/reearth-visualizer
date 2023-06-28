import { Meta, StoryObj } from "@storybook/react";

import Component from ".";

const meta: Meta<typeof Component> = {
  component: Component,
};

export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {
  args: {
    scenes: [
      { id: "0", label: "Basemap" },
      { id: "1", label: "Environment" },
      { id: "2", label: "Terrain", active: true },
      { id: "3", label: "Main Camera" },
    ],
  },
};

export const Empty: Story = {
  args: {
    scenes: [],
  },
};
