import { Meta } from "@storybook/react";

import Check from ".";

export default {
  title: "classic/atoms/Check",
  component: Check,
} as Meta;

export const Default = () => <Check value="value">Check</Check>;
