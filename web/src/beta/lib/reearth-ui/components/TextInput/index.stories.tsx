import { Meta, StoryObj } from "@storybook/react";

import { TextInput, TextInputProps } from ".";

const meta: Meta<TextInputProps> = {
  component: TextInput,
};

export default meta;
type Story = StoryObj<typeof TextInput>;

export const Default: Story = {
  args: {
    value: "Text Input",
  },
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: "Type in here.",
  },
};
