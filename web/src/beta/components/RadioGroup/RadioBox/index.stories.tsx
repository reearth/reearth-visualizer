import { useArgs } from "@storybook/preview-api";
import { Meta, StoryObj } from "@storybook/react";
import { useCallback } from "react";

import RadioBox from ".";

type Props = React.ComponentProps<typeof RadioBox>;

const meta: Meta<typeof RadioBox> = {
  component: RadioBox,
};

export default meta;

type Story = StoryObj<typeof RadioBox>;

export const Default: Story = (args: Props) => {
  const [_, updateArgs] = useArgs();

  const handleChange = useCallback(
    (value: string) => {
      console.log(value);
      updateArgs({ value });
    },
    [updateArgs],
  );

  return <RadioBox {...args} onClick={handleChange} />;
};

Default.args = {
  label: "test",
  selected: false,
  keyValue: "test",
};
