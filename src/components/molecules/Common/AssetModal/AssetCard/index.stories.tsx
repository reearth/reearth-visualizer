import { Meta, Story } from "@storybook/react";
import React from "react";

import Component, { Props } from ".";

export default {
  title: "molecules/EarthEditor/AssetsModal/AssetCard",
  component: Component,
} as Meta;

export const DefaultMedium: Story<Props> = args => <Component {...args} />;
export const MediumChecked: Story<Props> = args => <Component {...args} />;
export const SmallChecked: Story<Props> = args => <Component {...args} />;
export const LargeCheckedAndSelected: Story<Props> = args => <Component {...args} />;

DefaultMedium.args = {
  checked: false,
  cardSize: "medium",
  url: `${process.env.PUBLIC_URL}/sample.svg`,
  name: "hoge",
};

MediumChecked.args = {
  checked: true,
  cardSize: "medium",
  url: `${process.env.PUBLIC_URL}/sample.svg`,
  name: "hoge",
};

SmallChecked.args = {
  checked: true,
  cardSize: "small",
  url: `${process.env.PUBLIC_URL}/sample.svg`,
  name: "hoge",
};

LargeCheckedAndSelected.args = {
  checked: true,
  cardSize: "large",
  url: `${process.env.PUBLIC_URL}/sample.svg`,
  name: "hoge",
  selected: true,
};
