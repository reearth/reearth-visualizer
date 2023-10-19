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
    entityType: "image",
  },
};

export const AssetFileType: Story = {
  args: {
    name: "Asset",
    description: "Defaul Asset Uploader",
    fileType: "asset",
    entityType: "file",
  },
};

export const URLType: Story = {
  args: {
    name: "URL",
    description: "Defaul URL Input wrapper",
    fileType: "URL",
  },
};

export const AppearanceType: Story = {
  args: {
    name: "URL",
    description: "Defaul URL Input wrapper",
    fileType: "layerStyle",
    entityType: "layerStyle",
  },
};
