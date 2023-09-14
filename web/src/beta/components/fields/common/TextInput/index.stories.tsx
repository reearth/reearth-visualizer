import { Meta, StoryObj } from "@storybook/react";

import TextInput, { Props } from "./index";

const meta: Meta<Props> = {
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
    placeholder: "Text Input",
  },
};
