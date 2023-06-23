import { Meta, StoryObj } from "@storybook/react";

import PublishStateSwitchField from ".";

export default {
  component: PublishStateSwitchField,
} as Meta;

type Story = StoryObj<typeof PublishStateSwitchField>;

export const Default: Story = {
  args: {},
};
