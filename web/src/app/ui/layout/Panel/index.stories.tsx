import { Meta, StoryObj } from "@storybook/react";

import { Panel } from ".";

const meta: Meta<typeof Panel> = {
  component: Panel,
  decorators: [
    (Story) => (
      <div
        style={{
          width: 300,
          height: 300,
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Story />
      </div>
    )
  ]
};

export default meta;

type Story = StoryObj<typeof Panel>;

export const Default: Story = {
  args: {
    title: "Demo Panel",
    children: "Content"
  }
};

export const Extended: Story = {
  args: {
    title: "Demo Panel",
    extend: true,
    children: "Content"
  },
  parameters: {
    docs: {
      description: {
        story: "wrapper flex direction column required"
      }
    }
  }
};

export const AlwaysOpen: Story = {
  args: {
    title: "Demo Panel",
    alwaysOpen: true,
    children: "Content"
  }
};

export const Background: Story = {
  args: {
    title: "Demo Panel",
    background: "#000",
    children: "Content"
  }
};

export const Collapsed: Story = {
  args: {
    title: "Demo Panel",
    collapsed: true,
    children: "Content"
  }
};

export const NoPadding: Story = {
  args: {
    title: "Demo Panel",
    noPadding: true,
    children: "Content"
  }
};
