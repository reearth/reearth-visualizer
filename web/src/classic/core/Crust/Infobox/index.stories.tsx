import { Meta, Story } from "@storybook/react";

import Component, { Props, InfoboxProperty } from ".";

export default {
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
  argTypes: {
    showTitle: { type: { name: "boolean" } },
    title: { type: { name: "string" } },
    heightType: { type: { name: "enum", value: ["auto", "manual"] } },
    infoboxPaddingTop: { type: { name: "number" } },
    infoboxPaddingBottom: { type: { name: "number" } },
    infoboxPaddingLeft: { type: { name: "number" } },
    infoboxPaddingRight: { type: { name: "number" } },
    size: { type: { name: "number" } },
    position: { type: { name: "enum", value: ["right", "middle", "left"] } },
    bgcolor: { type: { name: "string" }, control: { type: "color" } },
    outlineColor: { type: { name: "string" }, control: { type: "color" } },
    outlineWidth: { type: { name: "number" } },
    useMask: { type: { name: "boolean" } },
  },
} as Meta;

const Template: Story<Props & InfoboxProperty> = args => (
  <Component
    {...args}
    property={{
      ...args.property,
      ...{
        showTitle: args.showTitle,
        title: args.title,
        heightType: args.heightType,
        infoboxPaddingBottom: args.infoboxPaddingBottom,
        infoboxPaddingTop: args.infoboxPaddingTop,
        infoboxPaddingLeft: args.infoboxPaddingLeft,
        infoboxPaddingRight: args.infoboxPaddingRight,
        size: args.size,
        position: args.position,
        bgcolor: args.bgcolor,
        outlineColor: args.outlineColor,
        outlineWidth: args.outlineWidth,
        useMask: args.useMask,
      },
    }}
  />
);
Template.args = {
  blocks: [
    {
      id: "a",
      pluginId: "reearth",
      extensionId: "textblock",
      property: {
        text: "# Hello",
        markdown: true,
      },
    },
    {
      id: "b",
      pluginId: "reearth",
      extensionId: "textblock",
      property: {
        text: "# World!",
        markdown: true,
      },
    },
  ],
  title: "Hoge",
  showTitle: true,
  visible: true,
};

export const Default = Template.bind({});
Default.args = {
  ...Template.args,
};

export const Large = Template.bind({});
Large.args = {
  ...Template.args,
  size: "large",
};
