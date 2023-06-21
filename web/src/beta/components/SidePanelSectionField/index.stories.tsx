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
    children: <p>Item</p>,
  },
};

export const Empty: Story = {
  args: {
    title: "Title",
  },
};
