import { Meta, StoryObj } from "@storybook/react";

import ActionItem from ".";

export default {
  component: ActionItem,
} as Meta;

type Story = StoryObj<typeof ActionItem>;

export const Default: Story = {
  render: () => <ActionItem title={"New Page"} icon={"square"} />,
};
