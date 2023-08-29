import { Meta, StoryObj } from "@storybook/react";

import RadioGroup from "./index";

const meta: Meta<typeof RadioGroup> = {
  component: RadioGroup,
};

export default meta;

type Story = StoryObj<typeof RadioGroup>;

const options = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
];

export const VerticalSingleSelect: Story = {
  render: () => <RadioGroup options={options} singleSelect layout="vertical" />,
};

export const HorizontalMultiSelect: Story = {
  render: () => <RadioGroup options={options} layout="horizontal" />,
};
