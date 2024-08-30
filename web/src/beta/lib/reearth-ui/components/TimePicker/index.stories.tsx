import { Meta, StoryObj } from "@storybook/react";

import { TimePicker, TimePickerProps } from ".";

const meta: Meta<TimePickerProps> = {
  component: TimePicker
};

export default meta;
type Story = StoryObj<typeof TimePicker>;

export const Default: Story = {
  args: {
    value: "Text Input"
  }
};

export const Disabled: Story = {
  args: {
    disabled: true
  }
};
