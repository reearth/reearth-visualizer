import { Meta, StoryObj } from "@storybook/react";

import { DatePicker, DatePickerProps } from ".";

const meta: Meta<DatePickerProps> = {
  component: DatePicker
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  args: {
    value: "25/05/2024"
  }
};

export const Disabled: Story = {
  args: {
    disabled: true
  }
};
