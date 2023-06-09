import { Meta, StoryObj } from "@storybook/react";

import Modal from ".";

const meta: Meta<typeof Modal> = {
  component: Modal,
};

export default meta;

type Story = StoryObj<typeof Modal>;

export const Small: Story = {
  args: {
    size: "sm",
    isVisible: true,
  },
};

export const Medium: Story = {
  args: {
    size: "md",
    isVisible: true,
  },
};
export const Large: Story = {
  args: {
    size: "lg",
    isVisible: true,
  },
};
