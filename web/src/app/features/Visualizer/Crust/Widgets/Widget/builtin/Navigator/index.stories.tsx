import { Meta, StoryFn } from "@storybook/react-vite";

import { contextEvents } from "../../storybook";

import Component, { Props } from ".";

export default {
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } }
} as Meta;

const Template: StoryFn<Props> = (args) => <Component {...args} />;

export const Default = Template.bind({});
Default.args = {
  context: { ...contextEvents }
};
