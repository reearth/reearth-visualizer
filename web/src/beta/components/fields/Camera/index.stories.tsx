import { Meta, StoryObj } from "@storybook/react";

import ColorField from ".";

const meta: Meta<typeof ColorField> = {
  component: ColorField,
};

export default meta;

type Story = StoryObj<typeof ColorField>;

export const CameraField: Story = {
  render: () => (
    <ColorField name="Camera" description="Camera field description" disabled={false} />
  ),
};
