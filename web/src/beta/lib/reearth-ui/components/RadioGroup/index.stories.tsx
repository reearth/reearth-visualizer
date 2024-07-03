import { Meta, StoryObj } from "@storybook/react";
import { FC, useState } from "react";

import { RadioGroup, RadioGroupProps } from ".";

const meta: Meta<RadioGroupProps> = {
  component: RadioGroup,
};

export default meta;

type Story = StoryObj<RadioGroupProps>;

const options = [
  { label: "option1", value: "Option 1" },
  { label: "option2", value: "Option 2" },
  { label: "option3", value: "Option 3" },
];

const RadioGroupWrapper: FC<RadioGroupProps> = props => {
  const [checkedValue, setCheckedValue] = useState<string | undefined>(undefined);

  const handleChange = (value: string) => {
    setCheckedValue(value);
    props.onChange?.(value);
  };

  return <RadioGroup {...props} checkedValue={checkedValue} onChange={handleChange} />;
};

export const Default: Story = {
  render: () => <RadioGroupWrapper options={options} />,
};

export const Horizontal: Story = {
  render: () => <RadioGroupWrapper options={options} layout="vertical" />,
};
