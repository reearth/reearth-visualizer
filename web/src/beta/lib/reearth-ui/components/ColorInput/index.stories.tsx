import { action } from "@storybook/addon-actions";
import { Meta, StoryObj } from "@storybook/react";

import { ColorInput, ColorInputProps } from ".";

const meta: Meta<ColorInputProps> = {
  component: ColorInput,
};

export default meta;
type Story = StoryObj<typeof ColorInput>;

export const ColorTypeIn: Story = {
  render: arg => <ColorInput value="" onChange={action("onChange")} {...arg} />,
};

export const ColorPicker: Story = {
  render: arg => <ColorInput onChange={action("onChange")} {...arg} />,
};

export const EnableAlphaChannel: Story = {
  render: arg => <ColorInput value={undefined} onChange={action("onChange")} {...arg} />,
  args: {
    alphaEnabled: true,
  },
};

export const Disabled: Story = {
  render: arg => <ColorInput {...arg} />,
  args: {
    disabled: true,
  },
};

export const SizeSmall: Story = {
  render: arg => <ColorInput value={undefined} onChange={action("onChange")} {...arg} />,
  args: {
    size: "small",
  },
};
