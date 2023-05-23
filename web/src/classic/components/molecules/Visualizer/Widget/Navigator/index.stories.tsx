import { Meta, Story } from "@storybook/react";

import { Provider } from "../../storybook";

import Component, { Props } from ".";

export default {
  title: "molecules/Visualizer/Widget/Navigator",
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<Props> = args => (
  <Provider>
    <Component {...args} />
  </Provider>
);

export const Default = Template.bind({});
