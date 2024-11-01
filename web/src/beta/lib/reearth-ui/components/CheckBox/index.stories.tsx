import { Meta, StoryObj } from "@storybook/react";

import { CheckBox, CheckBoxProps } from ".";

const meta: Meta<CheckBoxProps> = {
  component: CheckBox
};

export default meta;
type Story = StoryObj<typeof CheckBox>;

export const Default: Story = {
  args: {
    value: false
  }
};

export const Checked: Story = {
  args: {
    value: true
  }
};

export const Disabled: Story = {
  args: {
    value: true,
    disabled: true
  }
};
