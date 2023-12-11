import { Meta, StoryObj } from "@storybook/react";

import StoryPageIndicator from ".";

const meta: Meta<typeof StoryPageIndicator> = {
  component: StoryPageIndicator,
};

export default meta;

type Story = StoryObj<typeof StoryPageIndicator>;

export const Default: Story = {
  args: {
    currentPage: 3,
    maxPage: 5,
  },
};
