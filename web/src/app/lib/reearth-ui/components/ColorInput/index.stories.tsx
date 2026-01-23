import { Meta, StoryObj } from "@storybook/react-vite";

import { ColorInput, ColorInputProps } from ".";

// Mock function for actions
const fn = () => () => {};

const meta: Meta<ColorInputProps> = {
  component: ColorInput
};

export default meta;
type Story = StoryObj<typeof ColorInput>;

export const Default: Story = {
  render: () => <ColorInput onChange={fn()} />
};

export const AlphaDisabled: Story = {
  render: (arg) => <ColorInput onChange={fn()} {...arg} />,
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
  render: (arg) => <ColorInput onChange={fn()} {...arg} />,
  args: {
    size: "small"
  }
};
