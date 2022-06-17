import { Story, Meta } from "@storybook/react";

import Component, { Props, Layer } from ".";

export default {
  title: "molecules/EarthEditor/LayerMultipleSelectionModal",
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

export const Basic: Story<Props> = args => (
  <Component {...args} layers={layers} selected={["d", "e"]} />
);

Basic.args = {
  active: true,
};
