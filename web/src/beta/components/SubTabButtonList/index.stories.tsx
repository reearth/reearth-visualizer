import { Meta, StoryObj } from "@storybook/react";

import SubTabButtonList from ".";

const meta: Meta<typeof SubTabButtonList> = {
  component: SubTabButtonList,
};

export default meta;

type Story = StoryObj<typeof SubTabButtonList>;

export const Default: Story = {
  args: {
    items: [
      { id: "1", name: "GIS", active: true },
      { id: "2", name: "Story", active: false },
      { id: "3", name: "Web AR", active: false },
    ],
  },
};
