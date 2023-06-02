import { Meta, StoryObj } from "@storybook/react";

import SidePanelTitle from ".";

export default {
  title: "beta/components/SidePanelTitle",
  component: SidePanelTitle,
} as Meta;

type Story = StoryObj<typeof SidePanelTitle>;

export const Default: Story = {
  args: {
    title: "Inspector",
  },
};
