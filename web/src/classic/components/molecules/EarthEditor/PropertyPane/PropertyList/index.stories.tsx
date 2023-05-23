import { Meta, Story } from "@storybook/react";
import { ReactNode } from "react";

import PropertyList, { Props, Layer } from ".";

const Wrapper: React.FC<{ children?: ReactNode }> = ({ children }) => (
  <div style={{ width: 300 }}>{children}</div>
);

export default {
  title: "molecules/EarthEditor/PropertyPane/PropertyList",
  component: PropertyList,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const items = [
  { id: "a", title: "Tokyo", layerId: "a" },
  { id: "b", title: "Osaka", layerId: "c" },
  { id: "c", title: "Kyoto", layerId: "i" },
  { id: "d", title: "Tokyo", layerId: "e" },
  { id: "e", title: "Osaka", layerId: "g" },
  { id: "f", title: "Kyoto", layerId: "h" },
];

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
  { id: "h", title: "H" },
  { id: "i", title: "I" },
];

export const Default: Story<Props> = args => (
  <Wrapper>
    <PropertyList {...args} items={items} />
  </Wrapper>
);

Default.args = {
  name: "Items",
};

export const Selected: Story<Props> = args => (
  <Wrapper>
    <PropertyList {...args} items={items} />
  </Wrapper>
);

Selected.args = {
  name: "Items",
  selectedIndex: 1,
};

export const LayerMode: Story<Props> = args => (
  <Wrapper>
    <PropertyList {...args} layers={layers} items={items} />
  </Wrapper>
);

LayerMode.args = {
  name: "Items",
  selectedIndex: 1,
  layerMode: true,
};
