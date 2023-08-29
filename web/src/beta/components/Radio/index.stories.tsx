import { Meta, StoryObj } from "@storybook/react";

import Radio from ".";

const meta: Meta<typeof Radio> = {
  component: Radio,
};

export default meta;

type Story = StoryObj<typeof Radio>;

export const Default: Story = {
  render: () => <Radio label={"test"} inactive={false} selected={false} />,
};
