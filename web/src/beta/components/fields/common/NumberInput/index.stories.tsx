import { Meta, StoryObj } from "@storybook/react";

import NumberInput, { Props } from "./index";

const meta: Meta<Props> = {
  component: NumberInput,
};

export default meta;
type Story = StoryObj<typeof NumberInput>;

export const Default: Story = {
  args: {
    value: 42,
    inputDescription: "Value",
    suffix: "px",
  },
};

export const Disabled: Story = {
  args: {
    value: 15,
    inputDescription: "Disabled",
    suffix: "px",
    disabled: true,
  },
};

export const Range: Story = {
  args: {
    value: 50,
    inputDescription: "Range",
    suffix: "px",
    min: 4,
    max: 100,
  },
};

export const NoValue: Story = {
  args: {
    inputDescription: "No Value",
    suffix: "px",
  },
};

export const WithMinValue: Story = {
  args: {
    value: 5,
    inputDescription: "With Min Value",
    suffix: "px",
    min: 0,
  },
};

export const WithMaxValue: Story = {
  args: {
    value: 95,
    inputDescription: "With Max Value",
    suffix: "px",
    max: 100,
  },
};

export const Editable: Story = {
  args: {
    value: 25,
    inputDescription: "Editable",
    suffix: "px",
  },
};
