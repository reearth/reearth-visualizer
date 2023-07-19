import { Meta, StoryObj } from "@storybook/react";

import DragAndDropList from ".";

type Item = {
  id: number;
  text: string;
};

const meta: Meta<typeof DragAndDropList<Item>> = {
  component: DragAndDropList<Item>,
};

export default meta;

type Story = StoryObj<typeof DragAndDropList<Item>>;

export const Default: Story = {
  render: args => (
    <div style={{ maxHeight: "160px", overflowY: "auto", background: "gray" }}>
      <DragAndDropList {...args} />
    </div>
  ),
  args: {
    renderItem: item => <div>{item.text}</div>,
    getId: item => item.id.toString(),
    items: [
      {
        id: 1,
        text: "Hello World",
      },
      {
        id: 2,
        text: "Make it generic enough",
      },
      {
        id: 3,
        text: "Write README",
      },
      {
        id: 4,
        text: "Create some examples",
      },
      {
        id: 5,
        text: "Spam in Twitter and IRC to promote it (note that this element is taller than the others)",
      },
      {
        id: 6,
        text: "???",
      },
      {
        id: 7,
        text: "PROFIT",
      },
    ],
  },
};
