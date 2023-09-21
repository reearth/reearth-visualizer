import { Meta, StoryObj } from "@storybook/react";

import ContentPage from ".";

export default {
  component: ContentPage,
} as Meta;

type Story = StoryObj<typeof ContentPage>;

const dummyPages = [...Array(25)].map((_, i) => ({
  id: i.toString(),
  title: `Page ${i}`,
  swipeable: i % 2 === 0,
  blocks: [],
  property: {
    id: "1234",
    items: [],
  },
}));

export const Default: Story = {
  render: args => {
    return (
      <div style={{ height: "100vh" }}>
        <ContentPage {...args} />
      </div>
    );
  },
  args: {
    // need API mock
    storyPages: dummyPages,
    selectedPageId: dummyPages[1].id,
  },
};
