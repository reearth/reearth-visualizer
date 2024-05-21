import { Meta, StoryObj } from "@storybook/react";

import { PopupPanel, PopupPanelProps } from ".";

const meta: Meta<PopupPanelProps> = {
  component: PopupPanel,
};

export default meta;

type Story = StoryObj<typeof PopupPanel>;

export const Default: Story = {
  args: {
    title: "Title Two",
    children: <div style={{ padding: "4px 8px" }}> Content</div>,
  },
};
