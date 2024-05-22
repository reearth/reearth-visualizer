import { Meta, StoryObj } from "@storybook/react";

import { PopupPanel, PopupPanelProps } from ".";

const meta: Meta<PopupPanelProps> = {
  component: PopupPanel,
};

export default meta;

type Story = StoryObj<typeof PopupPanel>;

export const Default: Story = {
  args: {
    title: "Panel Title",
    children: (
      <div style={{ color: "#e0e0e0" }}>
        <p>Panel content</p>
        <p>Panel content</p>
        <p>Panel content</p>
        <p>Panel content</p>
      </div>
    ),
  },
};
