import { Meta, Story } from "@storybook/react";

import Component, { Props } from ".";

export default {
  title: "molecules/Visualizer/Infobox/Frame",
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<Props> = args => <Component {...args} />;

export const Default = Template.bind({});
Default.args = {
  title: "hello",
};

export const LongTitle = Template.bind({});
LongTitle.args = {
  title:
    "hellohellohellohellohellohellohellohellohellohhellohellohellohellohellohellohellohellohellohellohhellohellohellohellohellohellohellohellohellohellohhello",
};

export const LongCJKTitle = Template.bind({});
LongCJKTitle.args = {
  title:
    "こんにちは。こんにちは。こんにちは。こんにちは。こんにちは。こんにちは。こんにちは。こんにちは。こんにちは。こんにちは。こんにちは。こんにちは。こんにちは。こんにちは。こんにちは。こんにちは。",
};
