import { Meta, StoryObj } from "@storybook/react-vite";

import { Loading, LoadingProps } from ".";

const meta: Meta<LoadingProps> = {
  component: Loading
};

export default meta;
type Story = StoryObj<typeof Loading>;

export const Default: Story = {};
