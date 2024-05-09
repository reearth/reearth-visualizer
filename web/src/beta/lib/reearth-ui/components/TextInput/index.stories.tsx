import styled from "@emotion/styled";
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
const MockButton: FC = () => (
  <Button>
    <Icon icon="settings" size={20} />
  </Button>
);
const Button = styled.div`
  border-radius: "4px";
`;

export const WithActions: Story = {
  args: {
    actions: [MockButton],
  },
};
