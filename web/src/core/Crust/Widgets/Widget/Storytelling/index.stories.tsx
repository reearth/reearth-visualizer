import { Meta, Story } from "@storybook/react";

import { contextEvents } from "../storybook";

import Component, { Props } from ".";

export default {
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<Props> = args => <Component {...args} />;

export const Default = Template.bind({});

Default.args = {
  widget: {
    id: "",
    property: {
      stories: [
        { layer: "a", title: "a" },
        { layer: "b", title: "b" },
        { layer: "c", title: "c" },
      ],
    },
  },
  context: { ...contextEvents },
  isBuilt: false,
  isEditable: false,
};

export const AutoStart = Template.bind({});

AutoStart.args = {
  widget: {
    id: "",
    property: {
      stories: [
        { layer: "a", title: "a" },
        { layer: "b", title: "b" },
        { layer: "c", title: "c" },
      ],
      default: { autoStart: true },
    },
  },
  context: { ...contextEvents },
  isBuilt: false,
  isEditable: false,
};
