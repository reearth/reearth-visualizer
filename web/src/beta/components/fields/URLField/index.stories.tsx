import { Meta, StoryObj } from "@storybook/react";

import URLField, { Props } from ".";

const meta: Meta<Props> = {
  component: URLField,
};

export default meta;
type Story = StoryObj<typeof URLField>;

export const AssetImageType: Story = {
  args: {
    name: "Asset",
    description: "Defaul Asset Uploader",
    fileType: "asset",
    assetType: "image",
  },
};

export const AssetFileType: Story = {
  args: {
    name: "Asset",
    description: "Defaul Asset Uploader",
    fileType: "asset",
    assetType: "file",
  },
};

export const URLType: Story = {
  args: {
    name: "URL",
    description: "Defaul URL Input wrapper",
    fileType: "URL",
  },
};
