import React, { useState } from "react";

import { Meta, Story } from "@storybook/react";
import Component, { Props, Asset } from ".";

export default {
  title: "molecules/Common/AssetModal/AssetsContainer",
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
  const [selectedAssets, selectAsset] = useState<Asset[]>([]);
  return <Component {...args} selectedAssets={selectedAssets} selectAsset={selectAsset} />;
};
export const Multiple: Story<Props> = args => {
  const [selectedAssets, selectAsset] = useState<Asset[]>([]);
  return <Component {...args} selectedAssets={selectedAssets} selectAsset={selectAsset} />;
};

Default.args = {
  assets: assets,
};

Multiple.args = {
  assets: assets,
  isMultipleSelectable: true,
};
