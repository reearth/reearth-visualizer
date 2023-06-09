import { Meta, StoryObj } from "@storybook/react";

import Editor from ".";

const meta: Meta<typeof Editor> = {
  component: Editor,
};

export default meta;

type Story = StoryObj<typeof Editor>;

export const Scene: Story = {
  args: {
    sceneId: "dummy",
    tab: "scene",
  },
};

export const Storytelling: Story = {
  args: {
    sceneId: "dummy",
    tab: "story",
  },
};

export const Widgets: Story = {
  args: {
    sceneId: "dummy",
    tab: "widgets",
  },
};

export const Publish: Story = {
  args: {
    sceneId: "dummy",
    tab: "publish",
  },
};
