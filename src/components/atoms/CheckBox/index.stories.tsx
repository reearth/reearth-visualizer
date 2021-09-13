import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import React from "react";

import CheckBox from ".";

export default {
  title: "atoms/CheckBox",
  component: CheckBox,
} as Meta;

export const Default = () => <CheckBox checked onChange={action("onchange")} />;
