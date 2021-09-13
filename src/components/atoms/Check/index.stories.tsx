import { Meta } from "@storybook/react";
import React from "react";

import Check from ".";

export default {
  title: "atoms/Check",
  component: Check,
} as Meta;

export const Default = () => <Check value="value">Check</Check>;
