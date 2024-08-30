import { Meta, StoryObj } from "@storybook/react";

import { IconButton } from "../IconButton";

import { TextInput, TextInputProps } from ".";

const meta: Meta<TextInputProps> = {
  component: TextInput
};

export default meta;
type Story = StoryObj<typeof TextInput>;

export const Default: Story = {
  args: {
    value: "Text Input"
  }
};

export const Placeholder: Story = {
  args: {
    placeholder: "Type in here."
  }
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "Text Input"
  }
};

export const SizeSmall: Story = {
  args: {
    size: "small",
    value: "Text Input"
  }
};

export const UsecasePresent: Story = {
  args: {
    appearance: "present",
    disabled: true,
    value: "Text Input"
  }
};

export const UsecaseReadonly: Story = {
  args: {
    appearance: "readonly",
    disabled: true,
    value: "Text Input"
  }
};

export const Actions: Story = {
  args: {
    actions: [<IconButton key={1} icon="table" size="small" />],
    value: "Text Input"
  }
};
