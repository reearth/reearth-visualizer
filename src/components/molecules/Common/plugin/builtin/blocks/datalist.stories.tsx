import React from "react";
import { Meta } from "@storybook/react";
import DataList, { Item } from "./datalist";

const items: Item[] = [
  { id: "a", item_title: "Name", item_datastr: "Foo bar", item_datatype: "string" },
  { id: "b", item_title: "Age", item_datanum: 20, item_datatype: "number" },
  { id: "c", item_title: "Address", item_datastr: "New York", item_datatype: "string" },
];

export default {
  title: "molecules/Common/plugin/builtin/blocks/DataList",
  component: DataList,
} as Meta;

export const Default = () => <DataList property={{ items }} />;
export const Title = () => <DataList property={{ default: { title: "Title" }, items }} />;
export const Typography = () => (
  <DataList
    property={{
      default: { typography: { color: "red", fontSize: 16 } },
      items,
    }}
  />
);
export const NoItems = () => <DataList property={{}} />;
export const Selected = () => <DataList isSelected property={{ items }} />;
export const Editable = () => <DataList isSelected isEditable property={{ items }} />;
export const Built = () => <DataList isBuilt property={{ items }} />;
