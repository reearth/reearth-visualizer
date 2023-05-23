import { Meta, Story } from "@storybook/react";

import { Provider } from "../../storybook";

import Component, { Props } from ".";

export default {
  title: "molecules/Visualizer/Widget/Storytelling",
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<Props> = args => (
  <Provider>
    <Component {...args} />
  </Provider>
);

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
  isBuilt: false,
  isEditable: false,
};
