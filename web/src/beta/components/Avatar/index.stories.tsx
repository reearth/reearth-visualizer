import { Meta, StoryObj } from "@storybook/react";

import Avatar from ".";

const meta: Meta<typeof Avatar> = {
  component: Avatar,
};

export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = { render: () => <Avatar innerText="ReEarth" /> };
export const Small: Story = { render: () => <Avatar size="small" innerText="ReEarth" /> };
export const Large: Story = { render: () => <Avatar size="large" innerText="ReEarth" /> };
