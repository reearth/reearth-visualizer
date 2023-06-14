import { Meta, StoryObj } from "@storybook/react";

import Component from ".";

const meta: Meta<typeof Component> = {
  component: Component,
};

export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {
  args: {
    title: "Title",
    items: [{ label: "Item1" }, { label: "Item2" }, { label: "Item3" }],
  },
};

export const Empty: Story = {
  args: {
    title: "Title",
    items: [],
  },
};
