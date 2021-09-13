import { Story, Meta } from "@storybook/react";
import React, { Component } from "react";

import AdditionButton, { Props } from ".";

export default {
  title: "atoms/Buttons/AdditionButton",
  component: AdditionButton,
} as Meta;

export const Default: Story<Props> = args => <Component {...args} />;

Default.args = {};
