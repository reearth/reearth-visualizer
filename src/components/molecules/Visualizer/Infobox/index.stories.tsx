import React from "react";
import { Meta, Story } from "@storybook/react";

import Component, { Props } from ".";

export default {
  title: "molecules/Visualizer/Infobox",
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<Props> = args => <Component {...args} />;
Template.args = {
  blocks: [
    {
      id: "a",
      pluginId: "reearth",
      extensionId: "textblock",
      propertyId: "propertya",
      property: {
        default: {
          text: "# Hello",
          markdown: true,
        },
      },
    },
    {
      id: "b",
      pluginId: "reearth",
      extensionId: "textblock",
      propertyId: "propertya",
      property: {
        default: {
          text: "# World!",
          markdown: true,
        },
      },
    },
  ],
  property: {
    default: {
      title: "Hoge",
      size: "small",
    },
  },
  selectedBlockId: undefined,
  title: "Name",
  infoboxKey: "",
  isBuilt: false,
  isEditable: false,
  visible: true,
};

export const Default = Template.bind({});
Default.args = {
  ...Template.args,
};

export const Large = Template.bind({});
Large.args = {
  ...Template.args,
  property: {
    ...Template.args.property,
    default: {
      ...Template.args.property?.default,
      size: "large",
    },
  },
};
