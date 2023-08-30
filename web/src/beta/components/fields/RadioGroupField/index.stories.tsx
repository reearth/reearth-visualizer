import { useArgs } from "@storybook/preview-api";
import { Meta, StoryObj } from "@storybook/react";
import { useCallback } from "react";

import RadioGroupField from "./index";

type Props = React.ComponentProps<typeof RadioGroupField>;

const meta: Meta<typeof RadioGroupField> = {
  component: RadioGroupField,
};

export default meta;

type Story = StoryObj<typeof RadioGroupField>;

const options = [
  { key: "option1", label: "Option 1" },
  { key: "option2", label: "Option 2" },
];

export const Default: Story = (args: Props) => {
  const [_, updateArgs] = useArgs();

  const handleChange = useCallback((value: string[]) => updateArgs({ value }), [updateArgs]);

  return (
    <div>
      <RadioGroupField {...args} onChange={handleChange} />
    </div>
  );
};
Default.args = {
  value: options,
  onChange: () => console.log("clicked"),
  name: "Radio group field",
  description: "Radio group field",
};
