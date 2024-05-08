import styled from "@emotion/styled";
import { Meta, StoryObj } from "@storybook/react";
import { FC } from "react";

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

// TODO: use IconButton instead of MockButton
const MockButton: FC = () => <Button>Icon</Button>;
const Button = styled.div`
  border-radius: "4px";
`;

export const WithActions: Story = {
  args: {
    actions: [MockButton],
  },
};
