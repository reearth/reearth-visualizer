import { Meta, Story } from "@storybook/react";

import { contextEvents } from "./Widget/storybook";

import Component, { Props } from ".";

export default {
  component: Component,
  argTypes: {
    context: { control: false },
  },
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<Props> = args => (
  <div style={{ width: "100%", height: "100%" }}>
    <Component {...args} />
  </div>
);

export const Default = Template.bind({});

Default.args = {
  alignSystem: {
    inner: {
      center: {
        top: {
          align: "centered",
          widgets: [
            {
              id: "w",
              pluginId: "reearth",
              extensionId: "button",
              property: {
                default: {
                  buttonTitle: "Button 1",
                  buttonColor: "white",
                  buttonBgcolor: "red",
                },
              },
            },
            {
              id: "unknown",
              pluginId: "unknown",
              extensionId: "unknown",
            },
          ],
        },
      },
    },
  },
  context: {
    ...contextEvents,
  },
  editing: false,
  isBuilt: false,
  isEditable: false,
  renderWidget: ({ widget }) => <p>{widget.id}</p>,
};
