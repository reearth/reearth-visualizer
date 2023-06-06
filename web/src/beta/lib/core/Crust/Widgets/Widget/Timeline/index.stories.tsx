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
    extended: {
      horizontally: false,
      vertically: false,
    },
  },
  context: { ...contextEvents },
};

export const Extended = Template.bind({});

Extended.args = {
  widget: {
    id: "",
    extended: {
      horizontally: true,
      vertically: false,
    },
  },
  context: { ...contextEvents },
};
