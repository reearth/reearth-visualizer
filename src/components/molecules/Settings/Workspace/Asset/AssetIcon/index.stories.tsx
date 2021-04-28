import React from "react";
import { Meta } from "@storybook/react";
import AssetIcon from ".";

export default {
  title: "molecules/Settings/Workspace/Asset/AssetIcon",
  component: AssetIcon,
} as Meta;

export const Image = () => <AssetIcon type="image" />;
export const Video = () => <AssetIcon type="video" />;
export const Pdf = () => <AssetIcon type="pdf" />;
export const None = () => <AssetIcon />;
