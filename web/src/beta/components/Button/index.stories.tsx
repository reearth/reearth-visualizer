import { Meta, StoryObj } from "@storybook/react";

import Button from ".";

const meta: Meta<typeof Button> = {
  component: Button,
};

export default meta;

type Story = StoryObj<typeof Button>;

export const PrimarySmall: Story = { render: () => <Button buttonType="primary" text="Primary" /> };
export const PrimaryLarge: Story = {
  render: () => <Button buttonType="primary" text="Primary" large />,
};
export const SecondarySmall: Story = {
  render: () => <Button buttonType="secondary" text="secondary" />,
};
export const SecondaryLarge: Story = {
  render: () => <Button buttonType="secondary" text="secondary" large />,
};
export const DangerSmall: Story = { render: () => <Button buttonType="danger" text="danger" /> };
export const DangerLarge: Story = {
  render: () => <Button buttonType="danger" text="danger" large />,
};
export const Disabled: Story = {
  render: () => <Button buttonType="primary" text="disabled" icon="datasetAdd" disabled />,
};

export const WithIcon: Story = {
  render: () => <Button buttonType="primary" text="Primary" icon="datasetAdd" />,
};
export const WithIconRight: Story = {
  render: () => <Button buttonType="secondary" text="secondary" icon="datasetAdd" iconRight />,
};
