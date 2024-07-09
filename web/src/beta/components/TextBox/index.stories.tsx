import { Story, Meta } from "@storybook/react";

import Component, { Props } from ".";

export default {
  title: "classic/atoms/TextBox",
  component: Component,
  argTypes: {
    color: { control: "color" },
    backgroundColor: { control: "color" },
    borderColor: { control: "color" },
    floatedTextColor: { control: "color" },
  },
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

export const Basic: Story<Props> = args => <Component {...args} />;

Basic.args = {
  color: "#fff",
  backgroundColor: "#000",
  borderColor: "#fff",
  floatedTextColor: "#ccc",
  disabled: false,
  placeholder: "",
  prefix: "",
  suffix: "",
  multiline: false,
  throttle: false,
  throttleTimeout: 1000,
  value: "",
};
