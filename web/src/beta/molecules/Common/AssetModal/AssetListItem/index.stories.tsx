import { Meta, Story } from "@storybook/react";

import Component, { Props } from ".";

const imageAsset = {
  url: `/sample.svg`,
  name: "hoge",
  id: "hoge",
  teamId: "hoge",
  size: 4300,
  contentType: "asset-image",
};

const fileAsset = {
  url: `somewhere/sample.kml`,
  name: "hoge.kml",
  id: "hoge",
  teamId: "hoge",
  size: 4300,
  contentType: "asset-image",
};

export default {
  title: "classic/molecules/EarthEditor/AssetsModal/AssetListItem",
  component: Component,
} as Meta;

export const Image: Story<Props> = args => <Component {...args} />;
export const File: Story<Props> = args => <Component {...args} />;
export const CheckedAndSelected: Story<Props> = args => <Component {...args} />;

Image.args = {
  checked: false,
  asset: imageAsset,
};

File.args = {
  checked: false,
  asset: fileAsset,
};

CheckedAndSelected.args = {
  checked: true,
  asset: imageAsset,
  selected: true,
};
