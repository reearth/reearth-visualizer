import { Meta, StoryObj } from "@storybook/react";

import { RadioGroup, RadioGroupProps } from ".";

const meta: Meta<RadioGroupProps> = {
  component: RadioGroup
};

export default meta;

type Story = StoryObj<RadioGroupProps>;

const options = [
  { label: "option1", value: "Option 1" },
  { label: "option2", value: "Option 2" },
  { label: "option3", value: "Option 3" }
];

export const Default: Story = {
  render: () => <RadioGroup options={options} />
};

export const Horizontal: Story = {
  render: () => <RadioGroup options={options} layout="vertical" />
};
