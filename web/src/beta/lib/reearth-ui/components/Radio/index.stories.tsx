import { Meta, StoryObj } from "@storybook/react";
import { FC, useState } from "react";

import { Radio, RadioProps } from ".";

const meta: Meta<RadioProps> = {
  component: Radio,
};

export default meta;

type Story = StoryObj<RadioProps>;

const RadioWrapper: FC<Omit<RadioProps, "checked">> = props => {
  const [checked, setChecked] = useState(false);

  const handleChange = (value: string) => {
    setChecked(prevChecked => !prevChecked);
    props.onChange?.(value);
  };

  return <Radio {...props} checked={checked} onChange={handleChange} />;
};

export const Default: Story = {
  render: () => <RadioWrapper value={""} label="Radio button" />,
};

export const Disabled: Story = {
  render: () => <RadioWrapper value="" disabled={true} label="Radio button" />,
};
