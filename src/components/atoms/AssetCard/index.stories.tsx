import React from "react";

import { Meta, Story } from "@storybook/react";
import Component, { Props } from ".";

export default {
  title: "atoms/AssetCard",
  component: Component,
} as Meta;

export const Default: Story<Props> = args => <Component {...args} />;
export const Checked: Story<Props> = args => <Component {...args} />;

Default.args = {
  checked: false,
  cardSize: "small",
  url: `${process.env.PUBLIC_URL}/sample.svg`,
  name: "hoge",
};

Checked.args = {
  checked: true,
  cardSize: "small",
  url: `${process.env.PUBLIC_URL}/sample.svg`,
  name: "hoge",
};
