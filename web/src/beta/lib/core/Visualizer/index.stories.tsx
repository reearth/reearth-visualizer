import { Meta, Story } from "@storybook/react";

import Component, { Props } from ".";

export default {
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<Props> = args => <Component {...args} />;

export const Cesium = Template.bind({});

Cesium.args = {
  ready: true,
  engine: "cesium",
};

export const Plugin = Template.bind({});

Plugin.args = {
  ready: true,
  engine: "cesium",
  widgetAlignSystem: {
    outer: {
      left: {
        top: {
          align: "start",
          widgets: [
            {
              id: "plugin",
              pluginId: "plugin",
              extensionId: "test",
              ...({
                __REEARTH_SOURCECODE: `reearth.layers.add(${JSON.stringify({
                  id: "l",
                  type: "simple",
                  data: {
                    type: "geojson",
                    value: { type: "Feature", geometry: { type: "Point", coordinates: [0, 0] } },
                  },
                  marker: {
                    imageColor: "#fff",
                  },
                })});`,
              } as any),
            },
          ],
        },
      },
    },
  },
};
