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
    size: 4300,
    contentType: "asset-image",
  },
  {
    url: `${process.env.PUBLIC_URL}/sample.svg`,
    name: "hoge",
    id: "hoge",
    teamId: "hoge",
    size: 1010,
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
    size: 2400,
    contentType: "asset-image",
  },
  {
    url: `${process.env.PUBLIC_URL}/sample.svg`,
    name: "hoge",
    id: "hoge",
    teamId: "hoge",
    size: 1300,
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
    url: "www.filelocation.com/maps.kml",
    name: "hoge.kml",
    id: "hoge",
    teamId: "hoge",
    size: 100,
    contentType: "asset-file",
  },
  {
    url: `${process.env.PUBLIC_URL}/sample.svg`,
    name: "hoge",
    id: "hoge",
    teamId: "hoge",
    size: 4300,
    contentType: "asset-image",
  },
  {
    url: `${process.env.PUBLIC_URL}/sample.svg`,
    name: "hoge",
    id: "hoge",
    teamId: "hoge",
    size: 1010,
    contentType: "asset-image",
  },
];

export const Default: Story<Props> = args => {
  const [isOpen, open] = useState(true);
  return <Component {...args} isOpen={isOpen} onClose={() => open(!isOpen)} />;
};
export const Selected: Story<Props> = args => {
  const [isOpen, open] = useState(true);
  return <Component {...args} isOpen={isOpen} onClose={() => open(!isOpen)} />;
};
export const File: Story<Props> = args => {
  const [isOpen, open] = useState(true);
  return <Component {...args} isOpen={isOpen} onClose={() => open(!isOpen)} />;
};
export const Video: Story<Props> = args => {
  const [isOpen, open] = useState(true);
  return <Component {...args} isOpen={isOpen} onClose={() => open(!isOpen)} />;
};

Default.args = {
  assets: assets,
  fileType: "image",
};

Selected.args = {
  assets: assets,
  value: `${process.env.PUBLIC_URL}/sample.svg`,
  fileType: "image",
};

File.args = {
  assets: assets,
};

Video.args = {
  assets: assets,
  fileType: "video",
};
