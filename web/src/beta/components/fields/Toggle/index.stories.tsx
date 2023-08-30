import { useArgs } from "@storybook/preview-api";
import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import Property from "..";

import Toggle from ".";

type Props = React.ComponentProps<typeof Toggle>;

const meta: Meta<typeof Toggle> = {
  component: Toggle,
  argTypes: {
    size: {
      options: ["sm", "md"],
      control: { type: "radio" }, // Automatically inferred when 'options' is defined
    },
  },
};

export default meta;

type Story = StoryObj<typeof Toggle>;

export const Default: Story = (args: Props) => {
  const [_, updateArgs] = useArgs();

  const handleChange = (checked: boolean) => updateArgs({ checked: !checked });

  return (
    <>
      {/* TODO: Clean this and add some styling */}
      {/* <label htmlFor=""> Just the field</label> */}
      <Toggle {...args} onChange={handleChange} />
      {/* <label htmlFor=""> With property</label>
      <Property name="Switch Toggle">
        <Toggle {...args} onChange={handleChange} />
      </Property>
      */}
      <label htmlFor=""> With property and description</label>
      <Property name="Switch Toggle" description="Switch toggle description">
        <Toggle {...args} onChange={handleChange} />
      </Property>
    </>
  );
};

Default.args = {
  checked: false,
  disabled: false,
  size: "md",
};
