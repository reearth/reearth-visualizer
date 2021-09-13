import { Meta } from "@storybook/react";
import React from "react";

import Radio from ".";

export default {
  title: "atoms/Radio",
  component: Radio,
} as Meta;

export const Default = () => <Radio value="value">Radio</Radio>;
