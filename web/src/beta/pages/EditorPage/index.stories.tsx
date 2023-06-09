import { Meta, StoryObj } from "@storybook/react";

import EditorPage from ".";

const meta: Meta<typeof EditorPage> = {
  component: EditorPage,
  parameters: {
    reactRouter: {
      routePath: "/scene/:sceneId/:tab",
      routeParams: {
        sceneId: "dummy",
        tab: "scene",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof EditorPage>;

export const Default: Story = {};

export const NotFound: Story = {
  parameters: {
    reactRouter: {
      routeParams: {
        tab: "dummy",
      },
    },
  },
};
