import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";

import PropertyItem, { Layer } from ".";

export default {
  title: "molecules/EarthEditor/PropertyPane/PropertyItem",
  component: PropertyItem,
} as Meta;

const layers: Layer[] = [
  { id: "a", title: "A" },
  {
    id: "b",
    title: "B",
    group: true,
    children: [
      { id: "d", title: "xxxxxx" },
      { id: "e", title: "ああああ" },
      { id: "f", title: "F", group: true, children: [{ id: "g", title: "G" }] },
    ],
  },
  { id: "c", title: "C" },
];

export const Default = () => (
  <PropertyItem
    item={{
      id: "foo",
      schemaGroup: "foo",
      schemaFields: [
        {
          id: "bar",
          type: "string",
          name: "bar",
        },
      ],
      items: [],
    }}
    onChange={action("onChange")}
  />
);

export const List = () => (
  <PropertyItem
    item={{
      id: "foo",
      schemaGroup: "foo",
      schemaFields: [
        {
          id: "bar",
          type: "string",
          name: "bar",
        },
      ],
      items: [
        {
          id: "bar",
          fields: [
            {
              id: "bar",
              type: "string",
            },
          ],
        },
        {
          id: "hoge",
          fields: [
            {
              id: "hoge",
              type: "string",
              value: "hoge",
            },
          ],
        },
      ],
    }}
    onChange={action("onChange")}
    onItemAdd={action("onItemAdd")}
    onItemMove={action("onItemMove")}
    onItemRemove={action("onItemRemove")}
  />
);

export const NamedList = () => (
  <PropertyItem
    item={{
      id: "foo",
      schemaGroup: "foo",
      representativeField: "bar",
      schemaFields: [
        {
          id: "bar",
          type: "string",
          name: "bar",
        },
      ],
      items: [
        {
          id: "bar",
          fields: [
            {
              id: "bar",
              type: "string",
              value: "foo",
            },
          ],
        },
        {
          id: "hoge",
          fields: [
            {
              id: "hoge",
              type: "string",
              value: "hoge",
            },
          ],
        },
      ],
    }}
    onChange={action("onChange")}
    onItemAdd={action("onItemAdd")}
    onItemMove={action("onItemMove")}
    onItemRemove={action("onItemRemove")}
  />
);

export const LayerMode = () => (
  <PropertyItem
    item={{
      id: "foo",
      schemaGroup: "foo",
      representativeField: "foo",
      schemaFields: [
        {
          id: "foo",
          type: "ref",
          name: "foo",
          ui: "layer",
        },
        {
          id: "bar",
          type: "string",
          name: "bar",
        },
      ],
      items: [
        {
          id: "bar",
          fields: [
            {
              id: "foo",
              type: "ref",
              value: "d",
            },
            {
              id: "bar",
              type: "string",
              value: "hoge",
            },
          ],
        },
        {
          id: "hoge",
          fields: [
            {
              id: "foo",
              type: "ref",
              value: "e",
            },
            {
              id: "bar",
              type: "string",
              value: "hogehoge",
            },
          ],
        },
      ],
    }}
    layers={layers}
    onChange={action("onChange")}
    onItemAdd={action("onItemAdd")}
    onItemMove={action("onItemMove")}
    onItemRemove={action("onItemRemove")}
    onItemsUpdate={action("onItemsUpdate")}
  />
);
