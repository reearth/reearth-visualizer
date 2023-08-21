import { Meta, StoryObj } from "@storybook/react";

import LeftPanel from ".";

const meta: Meta<typeof LeftPanel> = {
  component: LeftPanel,
};

export default meta;

type Story = StoryObj<typeof LeftPanel>;

export const Default: Story = {
  args: {},
};
