import { Meta, StoryFn } from "@storybook/react-vite";

import { Provider } from "../storybook";

import Component, { Props } from ".";

export default {
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } }
} as Meta;

export const Default: StoryFn<Props> = (args) => (
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
  visible: true
};

export const Headless: StoryFn<Props> = (args) => (
  <Provider>
    <Component {...args} />
  </Provider>
);

Headless.args = {
  sourceCode: `console.log("hello world");`,
  visible: true
};
