import { Meta, Story } from "@storybook/react";

import { Provider } from "../storybook";

import Component, { Props } from ".";

export default {
  title: "molecules/Visualizer/Block",
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

export const Default: Story<Props> = args => <Component {...args} />;
Default.args = {
  block: {
    id: "",
    pluginId: "reearth",
    extensionId: "textblock",
    property: { default: { text: "hogehoge" } },
  },
  isSelected: false,
  isBuilt: false,
  isEditable: false,
};

export const Plugin: Story<Props> = args => (
  <Provider>
    <div style={{ background: "#fff" }}>
      <Component {...args} />
    </div>
  </Provider>
);
Plugin.args = {
  block: {
    id: "",
    pluginId: "plugins",
    extensionId: "block",
    property: {
      location: { lat: 0, lng: 100 },
    },
  },
  isSelected: false,
  isBuilt: false,
  isEditable: false,
  pluginBaseUrl: "",
};
