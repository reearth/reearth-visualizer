import { Meta, Story } from "@storybook/react";

import Component, { PluginAccordionProps } from ".";

export default {
  title: "molecules/Settings/Project/PluginAccordion",
  component: Component,
} as Meta;

export const Default: Story<PluginAccordionProps> = args => <Component {...args} />;

Default.args = {
  items: [
    {
      thumbnailUrl: `${process.env.PUBLIC_URL}/sample.svg`,
      title: "Sample",
      isInstalled: true,
      bodyMarkdown: "# Hoge ## Hoge",
      author: "reearth",
      pluginId: "id1",
    },
    {
      thumbnailUrl: `${process.env.PUBLIC_URL}/sample.svg`,
      title: "Sample2",
      isInstalled: false,
      bodyMarkdown: "# Fuga ## Fuga",
      author: "reearth",
      pluginId: "id2",
    },
  ],
};
