import { Meta, StoryObj } from "@storybook/react";

import TabMenu from "./index";

export default {
  component: TabMenu,
} as Meta;

type Story = StoryObj<typeof TabMenu>;

export const Default: Story = {
  args: {
    tabs: {
      tab1: { icon: "infobox", component: <div>Tab 1</div> },
      tab2: { icon: "dl", component: <div>Tab 2</div> },
    },
  },
};
