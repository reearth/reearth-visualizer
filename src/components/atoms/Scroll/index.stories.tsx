import { Meta, Story } from "@storybook/react";
import React from "react";

import Component, { Props } from ".";

export default {
  title: "atoms/Scroll",
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

export const Default: Story<Props> = args => (
  <div
    style={{
      width: "300px",
      height: "300px",
      border: "1px solid #fff",
      background: "#000",
      color: "#fff",
    }}>
    <Component {...args}>
      {new Array(100).fill("hogehoge").map((t, i) => (
        <div style={{ padding: "10px" }} key={i}>
          {t}
        </div>
      ))}
    </Component>
  </div>
);

Default.args = {};
