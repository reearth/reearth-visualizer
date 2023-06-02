import { Meta, Story } from "@storybook/react";

import { Provider } from "../storybook";

import Component, { Props } from ".";

export default {
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

export const Default: Story<Props> = args => (
  <Provider>
    <div style={{ background: "#fff" }}>
      <Component {...args} />
    </div>
  </Provider>
);

Default.args = {
  pluginId: "plugins",
  extensionId: "plugin",
  pluginBaseUrl: "",
  visible: true,
};

export const Headless: Story<Props> = args => (
  <Provider>
    <Component {...args} />
  </Provider>
);

Headless.args = {
  sourceCode: `console.log("hello world");`,
  visible: true,
};
