import { Meta } from "@storybook/react";

import RadioLabel from ".";

export default {
  title: "classic/atoms/RadioLabel",
  component: RadioLabel,
} as Meta;

export const Default = () => <RadioLabel label="default" value="default" checked={false} />;
export const Checked = () => <RadioLabel label="checked" value="checked" checked />;
export const Disabled = () => <RadioLabel label="checked" value="checked" disabled />;
