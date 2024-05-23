import { action } from "@storybook/addon-actions";
import { Meta, StoryObj } from "@storybook/react";
import { FC, useState } from "react";

import { ColorInput, ColorInputProps } from ".";

const meta: Meta<ColorInputProps> = {
  component: ColorInput,
};

export default meta;
type Story = StoryObj<typeof ColorInput>;

const MockChild: FC = () => {
  const [color, setColor] = useState("");

  const handleChange = (newColor: string) => {
    setColor(newColor);
    action("onChange")(newColor);
  };

  return <ColorInput value={color} onChange={handleChange} />;
};
export const Default: Story = {
  render: () => <MockChild />,
};
