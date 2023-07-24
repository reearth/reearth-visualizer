import { Meta, StoryObj } from "@storybook/react";

import ContentPage from ".";

export default {
  component: ContentPage,
} as Meta;

type Story = StoryObj<typeof ContentPage>;

export const Default: Story = {
  render: args => {
    return (
      <div style={{ height: "100vh" }}>
        <ContentPage {...args} />
      </div>
    );
  },
};
