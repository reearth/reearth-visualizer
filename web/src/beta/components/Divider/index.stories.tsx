import { Meta, StoryObj } from "@storybook/react";

import Divider from ".";

const meta: Meta<typeof Divider> = {
  component: Divider,
};

export default meta;

type Story = StoryObj<typeof Divider>;

export const divider: Story = { render: () => <Divider /> };
