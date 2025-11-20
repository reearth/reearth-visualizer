import { Meta, StoryObj } from "@storybook/react-vite";

import { Switcher, SwitcherProps } from ".";

// Mock function for actions
const fn = () => () => {};

const meta: Meta<SwitcherProps> = {
  component: Switcher
};

export default meta;

type Story = StoryObj<SwitcherProps>;

export const Default: Story = {
  render: () => <Switcher value={true} onChange={fn()} />
};

export const Disabled: Story = {
  render: () => (
    <Switcher value={false} onChange={fn()} disabled />
  )
};
