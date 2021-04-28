import React, { useState } from "react";

import { Meta, Story } from "@storybook/react";
import Component, { Props, Asset } from ".";

export default {
  title: "molecules/EarthEditor/AssetsModal",
  component: Component,
} as Meta;

const assets: Asset[] = [
  {
    url: `${process.env.PUBLIC_URL}/sample.svg`,
    name: "hoge",
    id: "hoge",
    teamId: "hoge",
    size: 100,
    contentType: "asset-image",
  },
  {
    url: `${process.env.PUBLIC_URL}/sample.svg`,
    name: "hoge",
    id: "hoge",
    teamId: "hoge",
    size: 100,
    contentType: "asset-image",
  },
  {
    url: `${process.env.PUBLIC_URL}/sample.svg`,
    name: "hoge",
    id: "hoge",
    teamId: "hoge",
    size: 100,
    contentType: "asset-image",
  },
  {
    url: `${process.env.PUBLIC_URL}/sample.svg`,
    name: "hoge",
    id: "hoge",
    teamId: "hoge",
    size: 100,
    contentType: "asset-image",
  },
  {
    url: `${process.env.PUBLIC_URL}/sample.svg`,
    name: "hoge",
    id: "hoge",
    teamId: "hoge",
    size: 100,
    contentType: "asset-image",
  },
  {
    url: `${process.env.PUBLIC_URL}/sample.svg`,
    name: "hoge",
    id: "hoge",
    teamId: "hoge",
    size: 100,
    contentType: "asset-image",
  },
];

export const Default: Story<Props> = args => {
  const [isOpen, open] = useState(true);
  return <Component {...args} isOpen={isOpen} onClose={() => open(!isOpen)} />;
};
export const Multiple: Story<Props> = args => {
  const [isOpen, open] = useState(true);
  return <Component {...args} isOpen={isOpen} onClose={() => open(!isOpen)} />;
};

Default.args = {
  assets: assets,
};

Multiple.args = {
  assets: assets,
  isMultipleSelectable: true,
};
