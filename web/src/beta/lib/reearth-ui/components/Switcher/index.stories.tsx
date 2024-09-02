import { action } from "@storybook/addon-actions";
import { Meta, StoryObj } from "@storybook/react";

import { Switcher, SwitcherProps } from ".";

const meta: Meta<SwitcherProps> = {
  component: Switcher
};

export default meta;

type Story = StoryObj<SwitcherProps>;

export const Default: Story = {
  render: () => <Switcher value={true} onChange={action("onChange")} />
};

export const Disabled: Story = {
  render: () => (
    <Switcher value={false} onChange={action("onChange")} disabled />
  )
};
