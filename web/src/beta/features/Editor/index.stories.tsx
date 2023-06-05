import { Meta, StoryObj } from "@storybook/react";
import { ComponentProps } from "react";

import Component from ".";

export default {
  component: Component,
} as Meta<ComponentProps<typeof Component>>;

export const Scene: StoryObj<typeof Component> = {
  args: {
    sceneId: "dummy",
    tab: "scene",
  },
};

export const Storytelling: StoryObj<typeof Component> = {
  args: {
    sceneId: "dummy",
    tab: "story",
  },
};

export const Widgets: StoryObj<typeof Component> = {
  args: {
    sceneId: "dummy",
    tab: "widgets",
  },
};

export const Publish: StoryObj<typeof Component> = {
  args: {
    sceneId: "dummy",
    tab: "publish",
  },
};
