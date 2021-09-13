import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import React from "react";

import Slider from ".";

export default {
  title: "atoms/Slider",
  component: Slider,
} as Meta;

export const Default = () => <Slider value={120} min={0} max={100} onChange={action("onchange")} />;
export const Frame = () => (
  <Slider value={120} min={0} max={100} onChange={action("onchange")} frame />
);
