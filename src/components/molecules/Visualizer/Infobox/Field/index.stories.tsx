import React from "react";
import { Meta, Story } from "@storybook/react";
import Field, { Props } from ".";

export default {
  title: "molecules/Visualizer/Infobox/Field",
  component: Field,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

export const Default: Story<Props> = args => (
  <Field {...args}>
    <h1>HogeHoge</h1>
  </Field>
);
Default.args = {
  id: "aaa",
};

export const Selected: Story<Props> = args => (
  <Field {...args}>
    <h1>HogeHoge</h1>
  </Field>
);
Selected.args = {
  id: "aaa",
  isEditable: true,
  isSelected: true,
};
