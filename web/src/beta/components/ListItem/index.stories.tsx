import { Meta, StoryObj } from "@storybook/react";

import ActionItem from "./index";

export default {
  component: ActionItem,
} as Meta;

type Story = StoryObj<typeof ActionItem>;

export const Default: Story = {
  args: {
    isSelected: false,
    actionContent: <div style={{ background: "gray" }}>actionContent</div>,
    isOpenAction: true,
    children:
      "long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text ",
  },
};
