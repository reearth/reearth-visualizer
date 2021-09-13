import { Story, Meta } from "@storybook/react";
import React from "react";

import Component, { Props, Layer } from ".";

export default {
  title: "molecules/EarthEditor/PropertyPane/PropertyField/LayerField",
  component: Component,
  argTypes: { onChange: { action: "onChange" } },
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const layers: Layer[] = [
  { id: "a", title: "A" },
  {
    id: "b",
    title: "B",
    group: true,
    children: [
      { id: "d", title: "xxx" },
      { id: "e", title: "aaa" },
      { id: "f", title: "F", group: true, children: [{ id: "g", title: "G" }] },
    ],
  },
  { id: "c", title: "C" },
];

export const Default: Story<Props> = args => <Component {...args} layers={layers} />;

Default.args = {
  value: "xxxx",
  linked: false,
  overridden: false,
  disabled: false,
};
