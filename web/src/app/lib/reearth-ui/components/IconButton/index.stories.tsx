import { Meta, StoryObj } from "@storybook/react-vite";

import { IconButton, IconButtonProps } from ".";

// Mock function for actions
const fn = () => () => {};

const meta: Meta<IconButtonProps> = {
  component: IconButton
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {
  args: {
    icon: "polyline",
    size: "normal",
    appearance: "secondary",
    onClick: fn()
  }
};

export const Primary: Story = {
  render: () => (
    <IconButton
      icon="polyline"
      appearance="primary"
      onClick={fn()}
    />
  )
};

export const Simple: Story = {
  render: () => (
    <IconButton
      icon="polyline"
      appearance="simple"
      onClick={fn()}
    />
  )
};

export const Disabled: Story = {
  render: () => (
    <IconButton
      icon="polyline"
      appearance="simple"
      disabled
      onClick={fn()}
    />
  )
};

export const Large: Story = {
  render: () => (
    <IconButton icon="polyline" size="large" onClick={fn()} />
  )
};

export const Small: Story = {
  render: () => (
    <IconButton icon="polyline" size="small" onClick={fn()} />
  )
};

export const Active: Story = {
  render: () => (
    <IconButton
      icon="polyline"
      appearance="primary"
      active
      onClick={fn()}
    />
  )
};
