import { Meta, StoryObj } from "@storybook/react";

import ImageBlock from ".";

export default {
  component: ImageBlock,
} as Meta;

type Story = StoryObj<typeof ImageBlock>;

export const Default: Story = {
  args: {
    src: "http://placehold.it/150X150",
  },
};
