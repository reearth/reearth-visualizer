import { Meta, StoryObj } from "@storybook/react";

import InsertionBar, { Props } from ".";

const meta: Meta<Props> = {
  component: InsertionBar
};

export default meta;

type Story = StoryObj<typeof InsertionBar>;

export const Default: Story = {
  args: {
    pos: "bottom",
    mode: "visible",
    onButtonClick: () => console.log("Button clicked"),
    children: "Insertion bar content"
  }
};

export const Hidden: Story = {
  args: {
    pos: "top",
    mode: "hidden",
    children: "Insertion bar content"
  }
};

export const Dragging: Story = {
  args: {
    pos: "bottom",
    mode: "dragging",
    children: "Insertion bar content"
  }
};
