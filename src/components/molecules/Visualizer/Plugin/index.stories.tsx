import React from "react";
import { Meta, Story } from "@storybook/react";

import Component, { Props } from ".";
import { Provider } from "../context";
import { context } from "../storybook";

export default {
  title: "molecules/Visualizer/Plugin",
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

export const Default: Story<Props> = args => (
  <Provider value={context}>
    <div style={{ background: "#fff" }}>
      <Component {...args} />
    </div>
  </Provider>
);

Default.args = {
  pluginId: "plugins",
  extensionId: "plugin",
  pluginBaseUrl: process.env.PUBLIC_URL,
  visible: true,
};

export const Headless: Story<Props> = args => (
  <Provider value={context}>
    <Component {...args} />
  </Provider>
);

Headless.args = {
  sourceCode: `console.log("hello world");`,
  visible: true,
};
