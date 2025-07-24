import { Meta, StoryObj } from "@storybook/react";

import { Radio, RadioProps } from ".";

const meta: Meta<RadioProps> = {
  component: Radio
};

export default meta;

type Story = StoryObj<RadioProps>;

export const Default: Story = {
  render: () => <Radio value={""} label="Radio button" checked={true} />
};

export const Disabled: Story = {
  render: () => <Radio value="" disabled={true} label="Radio button" />
};
