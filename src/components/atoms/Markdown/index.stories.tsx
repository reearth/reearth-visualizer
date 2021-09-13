import { Meta, Story } from "@storybook/react";
import React from "react";

import Component, { Props } from ".";

const markdown = `
> A block quote with ~strikethrough~ and a URL: https://reactjs.org.

* Lists
* [ ] todo
* [x] done

A table:

| a | b |
| - | - |
`;

export default {
  title: "atoms/Markdown",
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

export const Default: Story<Props> = args => <Component {...args} />;

Default.args = {
  children: markdown,
  backgroundColor: "#fff",
};
