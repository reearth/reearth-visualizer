import React from "react";

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
      id: "hogehoge",
      thumbnail: `sample.svg`,
      title: "Storytelling",
      isInstalled: true,
      bodyMarkdown: "# Hoge\n## Fuag",
    },
    {
      id: "fugafuga",
      thumbnail: `sample.svg`,
      title: "Storytelling",
      isInstalled: true,
      bodyMarkdown: "# Hoge\n## Fuag",
    },
  ],
};
