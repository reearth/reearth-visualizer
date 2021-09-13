import { Meta, Story } from "@storybook/react";
import React from "react";

import DataList, { Item, Props } from ".";

export default {
  title: "molecules/Visualizer/Block/DataList",
  component: DataList,
  argTypes: {
    onClick: { action: "onClick" },
    onChange: { action: "onChange" },
  },
} as Meta;

const items: Item[] = [
  { id: "a", item_title: "Name", item_datastr: "Foo bar", item_datatype: "string" },
  { id: "b", item_title: "Age", item_datanum: 20, item_datatype: "number" },
  { id: "c", item_title: "Address", item_datastr: "New York", item_datatype: "string" },
];

const Template: Story<Props> = args => <DataList {...args} />;

export const Default = Template.bind({});
Default.args = {
  block: { id: "", property: { items } },
};

export const Title = Template.bind({});
Title.args = {
  block: { id: "", property: { default: { title: "Title" }, items } },
};

export const Typography: Story<Props> = Template.bind({});
Typography.args = {
  block: {
    id: "",
    property: {
      default: { typography: { color: "red", fontSize: 16 } },
      items,
    },
  },
};

export const NoItems: Story<Props> = Template.bind({});
NoItems.args = { isEditable: true };

export const Selected: Story<Props> = Template.bind({});
Selected.args = { block: { id: "", property: { items } }, isSelected: true };

export const Editable: Story<Props> = Template.bind({});
Editable.args = {
  block: { id: "", property: { items } },
  isSelected: true,
  isEditable: true,
};

export const Built: Story<Props> = Template.bind({});
Built.args = {
  block: { id: "", property: { items } },
  isBuilt: true,
};
