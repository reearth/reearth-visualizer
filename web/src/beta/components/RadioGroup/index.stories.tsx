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
  { key: "option1", label: "Option 1" },
  { key: "option2", label: "Option 2" },
];

export const VerticalSingleSelect: Story = (args: Props) => {
  const [_, updateArgs] = useArgs();

  const handleChange = useCallback((value: string[]) => updateArgs({ value }), [updateArgs]);

  return (
    <div>
      <RadioGroup {...args} onChange={handleChange} />
    </div>
  );
};
VerticalSingleSelect.args = {
  options: options,
  layout: "vertical",
  onChange: () => console.log("clicked"),
  singleSelect: true,
};

export const HorizontalMultiSelect: Story = (args: Props) => {
  const [_, updateArgs] = useArgs();

  const handleChange = useCallback((value: string[]) => updateArgs({ value }), [updateArgs]);

  return (
    <div>
      <RadioGroup {...args} onChange={handleChange} />
    </div>
  );
};
HorizontalMultiSelect.args = {
  options: options,
  layout: "horizontal",
  onChange: () => console.log("clicked"),
  singleSelect: false,
};
