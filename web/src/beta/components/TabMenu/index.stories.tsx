import { Meta, StoryObj } from "@storybook/react";

import TabMenu from "./index";

export default {
  component: TabMenu,
} as Meta;

type Story = StoryObj<typeof TabMenu>;

export const Default: Story = {
  args: {
    tabs: {
      tab1: { icon: "t 1", component: <div>Tab 1</div> },
      tab2: { icon: "t 2", component: <div>Tab 2</div> },
    },
  },
};
