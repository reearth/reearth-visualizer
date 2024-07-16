import { Meta } from "@storybook/react";

import RadioButton from ".";

export default {
  title: "beta/components/Buttons/RadioButton",
  component: RadioButton,
} as Meta;

export const Default = () => <RadioButton value="default" checked={false} />;
export const Checked = () => <RadioButton value="checked" checked />;
