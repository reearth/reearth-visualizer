import { Meta, StoryObj } from "@storybook/react";

import ContentStory from ".";

export default {
  component: ContentStory,
} as Meta;

type Story = StoryObj<typeof ContentStory>;

export const Default: Story = {
  render: args => {
    return (
      <div style={{ height: "100vh" }}>
        <ContentStory {...args} />
      </div>
    );
  },
};
