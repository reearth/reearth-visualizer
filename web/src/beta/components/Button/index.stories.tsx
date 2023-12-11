import { Meta, StoryObj } from "@storybook/react";

import Button from ".";

const meta: Meta<typeof Button> = {
  component: Button,
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  render: () => <Button text="Default" />,
};

export const PrimarySmall: Story = {
  render: () => <Button buttonType="primary" text="Primary" size="small" />,
};

export const PrimaryMedium: Story = {
  render: () => <Button buttonType="primary" text="Primary" size="medium" />,
};

export const PrimaryDisabled: Story = {
  render: () => <Button buttonType="primary" text="Primary" disabled />,
};

export const SecondarySmall: Story = {
  render: () => <Button buttonType="secondary" text="secondary" size="small" />,
};

export const SecondaryMedium: Story = {
  render: () => <Button buttonType="secondary" text="secondary" size="medium" />,
};

export const SecondaryDisabled: Story = {
  render: () => <Button buttonType="secondary" text="secondary" disabled />,
};

export const DangerSmall: Story = {
  render: () => <Button buttonType="danger" text="danger" size="small" />,
};

export const DangerMedium: Story = {
  render: () => <Button buttonType="danger" text="danger" size="medium" />,
};

export const DangerDisabled: Story = {
  render: () => <Button buttonType="danger" text="danger" disabled />,
};

export const DisabledSmall: Story = {
  render: () => <Button buttonType="primary" text="disabled" size="small" disabled />,
};

export const DisabledMedium: Story = {
  render: () => <Button text="disabled" size="medium" disabled />,
};

export const WithLeftIconSmall: Story = {
  render: () => (
    <Button buttonType="primary" text="Primary" icon="book" size="small" iconPosition="left" />
  ),
};

export const WithRightIconSmall: Story = {
  render: () => (
    <Button buttonType="secondary" text="Primary" icon="book" size="small" iconPosition="right" />
  ),
};

export const WithLeftIconMedium: Story = {
  render: () => (
    <Button buttonType="primary" text="Primary" icon="book" size="medium" iconPosition="left" />
  ),
};

export const WithRightIconMedium: Story = {
  render: () => (
    <Button
      buttonType="secondary"
      text="Secondary"
      icon="book"
      size="medium"
      iconPosition="right"
    />
  ),
};
