import { action } from "@storybook/addon-actions";
import { Meta, StoryObj } from "@storybook/react";

import { IconButton, IconButtonProps } from ".";

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
    onClick: action("onClick")
  }
};

export const Primary: Story = {
  render: () => (
    <IconButton
      icon="polyline"
      appearance="primary"
      onClick={action("onClick")}
    />
  )
};

export const Simple: Story = {
  render: () => (
    <IconButton
      icon="polyline"
      appearance="simple"
      onClick={action("onClick")}
    />
  )
};

export const Disabled: Story = {
  render: () => (
    <IconButton
      icon="polyline"
      appearance="simple"
      disabled
      onClick={action("onClick")}
    />
  )
};

export const Large: Story = {
  render: () => (
    <IconButton icon="polyline" size="large" onClick={action("onClick")} />
  )
};

export const Small: Story = {
  render: () => (
    <IconButton icon="polyline" size="small" onClick={action("onClick")} />
  )
};

export const Active: Story = {
  render: () => (
    <IconButton
      icon="polyline"
      appearance="primary"
      active
      onClick={action("onClick")}
    />
  )
};
