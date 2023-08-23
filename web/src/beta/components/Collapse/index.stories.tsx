import { Meta, StoryObj } from "@storybook/react";

import Collapse from ".";

const meta: Meta<typeof Collapse> = {
  component: Collapse,
};

export default meta;

type Story = StoryObj<typeof Collapse>;

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

export const AlwaysOpen: Story = {
  args: {
    title: "Title",
    alwaysOpen: true,
    children: <p>Item</p>,
  },
};

export const StyleType: Story = {
  args: {
    title: "Settings",
    type: "settings",
    children: <p>Item</p>,
  },
};
