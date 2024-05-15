import { Meta, StoryObj } from "@storybook/react";
import { FC } from "react";

import Icon from "@reearth/beta/components/Icon";

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

export const Placeholder: Story = {
  args: {
    placeholder: "Type in here.",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "Text Input",
  },
};

export const SizeSmall: Story = {
  args: {
    size: "small",
    value: "Text Input",
  },
};

export const UsecasePresent: Story = {
  args: {
    appearance: "present",
    disabled: true,
    value: "Text Input",
  },
};

export const UsecaseReadonly: Story = {
  args: {
    appearance: "readonly",
    disabled: true,
    value: "Text Input",
  },
};
// TODO: use IconButton instead of MockButton
const MockButton: FC = () => <Icon icon="settings" size={12} />;

export const Actions: Story = {
  args: {
    actions: [MockButton],
    value: "Text Input",
  },
};
