import { action } from "@storybook/addon-actions";
import { Meta, StoryObj } from "@storybook/react";

import { ColorInput, ColorInputProps } from ".";

const meta: Meta<ColorInputProps> = {
  component: ColorInput
};

export default meta;
type Story = StoryObj<typeof ColorInput>;

export const Default: Story = {
  render: () => <ColorInput onChange={action("onChange")} />
};

export const AlphaDisabled: Story = {
  render: (arg) => <ColorInput onChange={action("onChange")} {...arg} />,
  args: {
    alphaDisabled: true
  }
};

export const Disabled: Story = {
  render: (arg) => <ColorInput {...arg} />,
  args: {
    disabled: true
  }
};

export const Small: Story = {
  render: (arg) => <ColorInput onChange={action("onChange")} {...arg} />,
  args: {
    size: "small"
  }
};
