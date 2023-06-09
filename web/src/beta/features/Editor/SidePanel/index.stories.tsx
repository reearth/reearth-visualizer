import { Meta, StoryObj } from "@storybook/react";

import SidePanel from ".";

const meta: Meta<typeof SidePanel> = {
  component: SidePanel,
  render: args => {
    return (
      <div style={{ height: "100vh", backgroundColor: "red" }}>
        <SidePanel {...args} />
      </div>
    );
  },
};

export default meta;

type Story = StoryObj<typeof SidePanel>;

export const LeftSingleContent: Story = {
  args: {
    location: "left",
    contents: [
      {
        id: "Title",
        title: "title",
        children: <div>content</div>,
      },
    ],
  },
};

export const RightMultiContents: Story = {
  args: {
    location: "left",
    contents: [
      {
        id: "a",
        title: "title",
        children: <div>content</div>,
      },
      {
        id: "b",
        title: (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>You can pass component as well</div>
            <div>can put icon etc</div>
          </div>
        ),
        maxHeight: "20%",
        children: <div>content</div>,
      },
    ],
  },
};
