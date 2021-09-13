import { Story, Meta } from "@storybook/react";
import React from "react";

import Component, { Props, Layer } from ".";

export default {
  title: "molecules/EarthEditor/LayerSelectionModal",
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const layers: Layer[] = [
  { id: "a", title: "A" },
  {
    id: "b",
    title: "B",
    group: true,
    children: [
      { id: "d", title: "xxxxxxxxxxxxxxx" },
      { id: "e", title: "ああああああああああああああああ" },
      { id: "f", title: "F", group: true, children: [{ id: "g", title: "G" }] },
    ],
  },
  { id: "c", title: "C" },
];

export const Basic: Story<Props> = args => <Component {...args} layers={layers} selected={"e"} />;

Basic.args = {
  active: true,
};
