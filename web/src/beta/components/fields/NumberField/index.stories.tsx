import { Meta, StoryObj } from "@storybook/react";

import NumberField, { Props } from ".";

const meta: Meta<Props> = {
  component: NumberField,
};

export default meta;
type Story = StoryObj<typeof NumberField>;

export const Default: Story = {
  args: {
    name: "Number Field",
    description: "The Number field",
    value: 42,
    inputDescription: "Value",
    suffix: "px",
  },
};

export const Disabled: Story = {
  args: {
    name: "Number Field",
    description: "The Number field",
    value: 15,
    inputDescription: "Disabled",
    suffix: "px",
    disabled: true,
  },
};

export const Range: Story = {
  args: {
    name: "Number Field",
    description: "The Number field",
    value: 50,
    inputDescription: "Range",
    suffix: "px",
    min: 4,
    max: 100,
  },
};

export const NoValue: Story = {
  args: {
    name: "Number Field",
    description: "The Number field",
    inputDescription: "No Value",
    suffix: "px",
  },
};

export const WithMinValue: Story = {
  args: {
    name: "Number Field",
    description: "The Number field",
    value: 5,
    inputDescription: "With Min Value",
    suffix: "px",
    min: 0,
  },
};

export const WithMaxValue: Story = {
  args: {
    name: "Number Field",
    description: "The Number field",
    value: 95,
    inputDescription: "With Max Value",
    suffix: "px",
    max: 100,
  },
};

export const Editable: Story = {
  args: {
    name: "Number Field",
    description: "The Number field",
    value: 25,
    inputDescription: "Editable",
    suffix: "px",
  },
};
