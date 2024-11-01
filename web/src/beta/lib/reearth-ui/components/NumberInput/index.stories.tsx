import { Meta, StoryObj } from "@storybook/react";

import { NumberInput, NumberInputProps } from ".";

const meta: Meta<NumberInputProps> = {
  component: NumberInput
};

export default meta;
type Story = StoryObj<typeof NumberInput>;

export const Default: Story = {
  args: {
    value: 1
  }
};

export const SizeSmall: Story = {
  args: {
    placeholder: "Type number in here.",
    size: "small",
    value: 2
  }
};

export const Placeholder: Story = {
  args: {
    placeholder: "Type number in here."
  }
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 4
  }
};

export const UsecaseReadonly: Story = {
  args: {
    value: 20,
    disabled: true,
    appearance: "readonly"
  }
};

export const UsecaseUnit: Story = {
  args: {
    unit: "m",
    value: 10
  }
};

export const UsecaseMinMax: Story = {
  args: {
    min: 1,
    value: 10,
    max: 20
  }
};
