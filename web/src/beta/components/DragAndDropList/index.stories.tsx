import { Meta, StoryObj } from "@storybook/react";

import DragAndDropList from ".";

type Item = {
  id: string;
  text: string;
};

const meta: Meta<typeof DragAndDropList<Item>> = {
  component: DragAndDropList<Item>,
};

export default meta;

type Story = StoryObj<typeof DragAndDropList<Item>>;

export const Default: Story = {
  render: args => (
    <div style={{ maxHeight: "320px", overflowY: "auto", background: "gray", padding: "24px" }}>
      <DragAndDropList {...args} />
    </div>
  ),
  args: {
    uniqueKey: "uniqueKey",
    renderItem: item => (
      <div
        style={{
          border: "1px solid blue",
          padding: "0.5rem 1rem",
          backgroundColor: "lightgray",
        }}>
        {item.text}
      </div>
    ),
    getId: item => item.id.toString(),
    items: [...Array(10)].map((_, i) => {
      const str = `${i} Sample ID / Text`;
      return { id: str, text: str };
    }),
    gap: 16,
    // onItemDrop: (id, index) => console.log(id, index),
  },
};
