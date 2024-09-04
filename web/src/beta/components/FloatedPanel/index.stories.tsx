import { css } from "@emotion/react";
import { Meta, StoryFn } from "@storybook/react";

import FloatedPanel, { Props } from ".";

const meta: Meta<Props> = {
  component: FloatedPanel
};

export default meta;

const Template: StoryFn<Props> = (args) => <FloatedPanel {...args} />;

export const Default = Template.bind({});
Default.args = {
  visible: true,
  children: "This is the content of the floated panel"
};

export const Hidden = Template.bind({});
Hidden.args = {
  visible: false,
  children: "This is the content of the floated panel"
};

export const CustomStyles = Template.bind({});
CustomStyles.args = {
  visible: true,
  children: "This is the content of the floated panel",
  styles: css`
    background-color: lightblue;
    color: white;
    padding: 10px;
  `
};
