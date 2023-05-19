import { Meta, Story } from "@storybook/react";

import HTML, { Props } from ".";

export default {
  component: HTML,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<Props> = args => <HTML {...args} />;

export const Default = Template.bind({});
Default.args = {
  block: { id: "", property: { html: "<p style='color: red;'>aaaaaa</p>" } },
  isSelected: false,
  isBuilt: false,
  isEditable: false,
};

export const Title = Template.bind({});
Title.args = {
  block: { id: "", property: { html: "<p style='color: red'>aaaaaa</p>", title: "Title" } },
  isSelected: false,
  isBuilt: false,
  isEditable: false,
};

export const NoText = Template.bind({});
NoText.args = {
  isSelected: false,
  isBuilt: false,
  isEditable: true,
};
