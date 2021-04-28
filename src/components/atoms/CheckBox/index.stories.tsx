import React from "react";
import { Meta } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import CheckBox from ".";

export default {
  title: "atoms/CheckBox",
  component: CheckBox,
} as Meta;

export const Default = () => <CheckBox checked onChange={action("onchange")} />;
