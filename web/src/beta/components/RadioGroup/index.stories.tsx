import { useArgs } from "@storybook/preview-api";
import { Meta, StoryObj } from "@storybook/react";
import { useCallback } from "react";

import RadioGroup from "./index";

type Props = React.ComponentProps<typeof RadioGroup>;

const meta: Meta<typeof RadioGroup> = {
  component: RadioGroup,
};

export default meta;

type Story = StoryObj<typeof RadioGroup>;

const options = [
  { label: "option1", keyValue: "Option 1" },
  { label: "option2", keyValue: "Option 2" },
];

export const VerticalRadioGroup: Story = (args: Props) => {
  const [_, updateArgs] = useArgs();

  const handleChange = useCallback((value: string) => updateArgs({ value }), [updateArgs]);

  return (
    <div>
      <RadioGroup {...args} onChange={handleChange} />
    </div>
  );
};
VerticalRadioGroup.args = {
  options: options,
  layout: "vertical",
  onChange: () => console.log("clicked"),
};

export const HorizontalRadioGroup: Story = (args: Props) => {
  const [_, updateArgs] = useArgs();

  const handleChange = useCallback((value: string) => updateArgs({ value }), [updateArgs]);

  return (
    <div>
      <RadioGroup {...args} onChange={handleChange} />
    </div>
  );
};
HorizontalRadioGroup.args = {
  options: options,
  layout: "horizontal",
  onChange: () => console.log("clicked"),
};
