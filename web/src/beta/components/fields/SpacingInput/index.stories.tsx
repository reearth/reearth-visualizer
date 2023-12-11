import { Meta, Story } from "@storybook/react";

import SpacingInput from "./index";

export default {
  component: SpacingInput,
} as Meta;

const Template: Story = args => <SpacingInput {...args} />;

export const Default = Template.bind({});
Default.args = {
  name: "Padding",
  description: "Adjust the padding values",
};

export const WithValues = Template.bind({});
WithValues.args = {
  name: "Padding",
  description: "Adjust the padding values",
  value: {
    top: "10",
    left: "20",
    right: "30",
    bottom: "40",
  },
};
