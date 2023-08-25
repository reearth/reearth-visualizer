import { Meta, StoryObj } from "@storybook/react";

import PluginAccordion from ".";

const meta: Meta<typeof PluginAccordion> = {
  component: PluginAccordion,
};

export default meta;

type Story = StoryObj<typeof PluginAccordion>;

export const Default: Story = {
  args: {
    plugins: [
      {
        thumbnailUrl: `/sample.svg`,
        title: "Sample",
        isInstalled: true,
        bodyMarkdown: "# Hoge ## Hoge",
        author: "reearth",
        pluginId: "id1",
      },
      {
        thumbnailUrl: `/sample.svg`,
        title: "Sample2",
        isInstalled: false,
        bodyMarkdown: "# Fuga ## Fuga",
        author: "reearth",
        pluginId: "id2",
      },
    ],
  },
};
