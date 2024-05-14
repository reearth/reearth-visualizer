import { Meta, StoryObj } from "@storybook/react";

import { Button, ButtonProps } from ".";

const meta: Meta<ButtonProps> = {
  component: Button,
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Button title="Secondary" />
      <Button title="Secondary Small" size="small" />
      <Button title="Secondary Disabled" disabled={true} />
      <Button title="Secondary Icon Button" icon="ICON" />
      <Button iconButton={true} icon="ICON" />
      <Button iconButton={true} icon="ICON" size="small" />
    </div>
  ),
};

export const Primary: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Button title="Primary" appearance="primary" />
      <Button title="Primary Small" appearance="primary" size="small" />
      <Button title="Primary Disabled" appearance="primary" disabled={true} />
      <Button title="Primary Icon Button" appearance="primary" icon="ICON" />
      <Button appearance="primary" iconButton={true} icon="ICON" />
      <Button appearance="primary" iconButton={true} icon="ICON" size="small" />
    </div>
  ),
};

export const Dangerous: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Button title="Dangerous" appearance="dangerous" />
      <Button title="Dangerous Small" appearance="dangerous" size="small" />
      <Button title="Dangerous Disabled" appearance="dangerous" disabled={true} />
      <Button title="Dangerous Icon Button" appearance="dangerous" icon="ICON" />
      <Button appearance="dangerous" iconButton={true} icon="ICON" />
      <Button appearance="dangerous" iconButton={true} icon="ICON" size="small" />
    </div>
  ),
};

export const Simple: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Button title="Simple" appearance="simple" />
      <Button title="Simple Small" appearance="simple" size="small" />
      <Button title="Simple Disabled" appearance="simple" disabled={true} />
      <Button title="Simple Icon Button" appearance="simple" icon="ICON" />
      <Button appearance="simple" iconButton={true} icon="ICON" />
      <Button appearance="simple" iconButton={true} icon="ICON" size="small" />
    </div>
  ),
};
