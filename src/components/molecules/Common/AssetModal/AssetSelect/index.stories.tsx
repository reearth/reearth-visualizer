import { Meta, Story } from "@storybook/react";
import React from "react";

import Component, { Props } from ".";

const filterOptions: { key: string; label: string }[] = [
  { key: "time", label: "Time" },
  { key: "size", label: "File size" },
  { key: "name", label: "Alphabetical" },
];

export default {
  title: "molecules/EarthEditor/AssetsModal/AssetSelect",
  component: Component,
} as Meta;

export const Default: Story<Props> = args => <Component {...args} />;

Default.args = {
  items: filterOptions,
  value: "time",
};
