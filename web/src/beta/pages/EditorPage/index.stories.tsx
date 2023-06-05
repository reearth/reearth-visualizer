import { Meta, StoryObj } from "@storybook/react";
import { ComponentProps } from "react";

import Component from ".";

export default {
  component: Component,
  parameters: {
    reactRouter: {
      routePath: "/scene/:sceneId/:tab",
      routeParams: {
        sceneId: "dummy",
        tab: "scene",
      },
    },
  },
} as Meta<ComponentProps<typeof Component>>;

export const Default: StoryObj<typeof Component> = {};

export const NotFound: StoryObj<typeof Component> = {
  parameters: {
    reactRouter: {
      routeParams: {
        tab: "dummy",
      },
    },
  },
};
