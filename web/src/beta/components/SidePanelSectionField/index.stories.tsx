import { Meta, StoryObj } from "@storybook/react";

import { colors } from "@reearth/services/theme";

import Component from ".";

const meta: Meta<typeof Component> = {
  component: Component,
};

export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {
  args: {
    publishedTheme: {
      strongText: "",
      mainText: colors.publish.dark.text.main,
      weakText: "",
      strongIcon: "",
      mainIcon: "",
      weakIcon: "",
      select: "",
      mask: "",
      background: "",
    },
    title: "Title",
    children: <p>Item</p>,
  },
  render: args => {
    return <Component {...args} />;
  },
};

export const Empty: Story = {
  args: {
    title: "Title",
  },
};
