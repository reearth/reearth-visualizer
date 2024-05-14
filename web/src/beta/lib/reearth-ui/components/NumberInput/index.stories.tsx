import { Meta, StoryObj } from "@storybook/react";

import { NumberInput, NumberInputProps } from ".";

const meta: Meta<NumberInputProps> = {
  component: NumberInput,
};

export default meta;
type Story = StoryObj<typeof NumberInput>;

export const Default: Story = {
  args: {
    value: 1,
  },
};

export const WithSmallSize: Story = {
  args: {
    placeholder: "Type number in here.",
    size: "small",
  },
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: "Type number in here.",
  },
};

export const WithApperancReadOnly: Story = {
  args: {
    value: 20,
    appearance: "readonly",
  },
};

export const WithUnit: Story = {
  args: {
    unit: "m",
  },
};
