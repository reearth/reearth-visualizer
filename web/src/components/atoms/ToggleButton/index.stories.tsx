import { Meta } from "@storybook/react";

import ToggleButton from ".";

export default {
  title: "atoms/Buttons/ToggleButton",
  component: ToggleButton,
} as Meta;

export const Default = () => <ToggleButton checked={false} />;
export const Checked = () => <ToggleButton checked />;
