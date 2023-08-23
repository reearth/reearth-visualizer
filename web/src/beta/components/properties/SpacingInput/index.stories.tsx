import { Meta, Story } from "@storybook/react";

import SpacingInput from "./index";

export default {
  title: "Components/SpacingInput",
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
    top: "10px",
    left: "20px",
    right: "30px",
    bottom: "40px",
  },
};
