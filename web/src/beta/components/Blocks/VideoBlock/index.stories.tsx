import { Meta, StoryObj } from "@storybook/react";

import VideoBlock from ".";

export default {
  component: VideoBlock,
} as Meta;

type Story = StoryObj<typeof VideoBlock>;

export const Default: Story = {
  args: {
    url: "https://youtu.be/Zhx1n6uvgUE",
  },
};
