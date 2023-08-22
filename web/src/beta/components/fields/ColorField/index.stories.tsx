import { action } from "@storybook/addon-actions";
import { Meta, StoryObj } from "@storybook/react";

import ColorField from ".";

const meta: Meta<typeof ColorField> = {
  component: ColorField,
};

export default meta;

type Story = StoryObj<typeof ColorField>;

export const ColorFieldInput: Story = {
  render: () => <ColorField name="Color Field" onChange={action("onchange")} />,
};
