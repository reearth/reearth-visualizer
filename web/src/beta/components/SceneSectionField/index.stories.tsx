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
      { label: "Basemap" },
      { label: "Environment" },
      { label: "Terrain" },
      { label: "Main Camera" },
    ],
  },
};

export const Empty: Story = {
  args: {
    scenes: [],
  },
};
