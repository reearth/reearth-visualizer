import React from "react";
import { Meta } from "@storybook/react";
import InfoboxBlock, { Block } from ".";

const textBlock: Block = {
  pluginId: "hogehoge",
  extensionId: "text",
  id: "block3",
  pluginProperty: {},
  property: {
    title: "Text",
    text: "texttexttext",
  },
  isLinked: false,
};

export default {
  title: "molecules/EarthEditor/InfoBox/InfoboxBlock",
  component: InfoboxBlock,
} as Meta;

export const Default = () => <InfoboxBlock block={textBlock} />;
export const Editable = () => <InfoboxBlock isEditable block={textBlock} />;
export const Built = () => <InfoboxBlock isBuilt block={textBlock} />;
