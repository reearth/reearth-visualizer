import { Meta, StoryObj } from "@storybook/react";

import TextField, { Props } from "./index";

const meta: Meta<Props> = {
  component: TextField,
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Default: Story = {
  args: {
    name: "Text input field",
    value: "Text field",
    description: "The text input description",
  },
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: "Text Input",
    name: "Text input field",
    description: "The text input description",
  },
};
