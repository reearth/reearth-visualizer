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

export const WithPlaceholder: Story = {
  args: {
    placeholder: "Type in here.",
  },
};

export const withDisable: Story = {
  args: {
    disabled: true,
    value: "Text Input",
  },
};

export const withNormalSize: Story = {
  args: {
    size: "normal",
    value: "Text Input",
  },
};
export const withSmallSize: Story = {
  args: {
    size: "small",
    value: "Text Input",
  },
};

export const withPresentAppearance: Story = {
  args: {
    appearance: "present",
    value: "Text Input",
  },
};

export const withReadonlyAppearance: Story = {
  args: {
    appearance: "readonly",
    value: "Text Input",
  },
};
// TODO: use IconButton instead of MockButton
const MockButton: FC = () => <Icon icon="settings" size={20} />;

export const WithActions: Story = {
  args: {
    actions: [MockButton],
  },
};
