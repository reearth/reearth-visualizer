import { action } from "@storybook/addon-actions";
import { Meta, StoryObj } from "@storybook/react";

import ColorField from ".";

const meta: Meta<typeof ColorField> = {
  component: ColorField,
};

export default meta;

type Story = StoryObj<typeof ColorField>;

export const CameraField: Story = {
  render: () => (
    <ColorField
      name="Color Field"
      description="Camera field description"
      onChange={action("onchange")}
    />
  ),
};
