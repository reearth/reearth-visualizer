import React from "react";

import { Meta, Story } from "@storybook/react";
import Table, { Props } from ".";

export default {
  title: "atoms/Table",
  component: Table,
} as Meta;

const headers = ["title", "lat", "lng", "size", "color", "text"];
type Rows = typeof headers[number];
type Item = { [k in Rows]: string | number };
const data: Item[] = [
  {
    title: "Japan",
    lat: 35.03,
    lng: 135.71,
    size: 10,
    color: "#3d86fa",
    text: "short text",
  },
  {
    title: "America",
    lat: 50.1,
    lng: 170.71,
    size: 40,
    color: "#ffffff",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
];

export const Default: Story<Props<Item>> = args => <Table {...args} />;

export const Scroll: Story<Props<Item>> = args => <Table {...args} />;
export const Auto: Story<Props<Item>> = args => <Table {...args} />;

Default.args = {
  headers,
  items: data,
  scroll: false,
};

Scroll.args = {
  headers,
  items: data,
  layout: "fixed",
  columnWidth: "100px",
  width: "400px",
};

Auto.args = {
  headers,
  items: data,
  layout: "auto",
  scroll: false,
};
