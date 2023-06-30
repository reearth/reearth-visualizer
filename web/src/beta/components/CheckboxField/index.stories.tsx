import { Meta, StoryObj } from "@storybook/react";

import CheckBoxField from ".";

const meta: Meta<typeof CheckBoxField> = {
  component: CheckBoxField,
};

export default meta;

type Story = StoryObj<typeof CheckBoxField>;

export const Default: Story = {
  args: {
    label: "takanawa_3D_Tiles",
    checked: false,
  },
};
