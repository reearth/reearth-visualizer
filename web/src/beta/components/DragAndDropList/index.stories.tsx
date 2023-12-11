import { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import DragAndDropList from ".";

type DummyItem = {
  id: string;
  text: string;
};

const meta: Meta<typeof DragAndDropList<DummyItem>> = {
  component: DragAndDropList<DummyItem>,
};

export default meta;

type Story = StoryObj<typeof DragAndDropList<DummyItem>>;

const dummyItems: DummyItem[] = [...Array(10)].map((_, i) => {
  const str = `${i} Sample ID / Text`;
  return { id: str, text: str };
});

const DummyComponent: typeof DragAndDropList<DummyItem> = args => {
  const [items, setItems] = useState<DummyItem[]>(dummyItems);
  return (
    <DragAndDropList<DummyItem>
      {...args}
      items={items}
      onItemDrop={(item, index) => {
        // actual use case would be api call or optimistic update
        setItems(old => {
          const items = [...old];
          items.splice(
            old.findIndex(o => o.id === item.id),
            1,
          );
          items.splice(index, 0, item);
          return items;
        });
      }}
    />
  );
};

export const Default: Story = {
  render: args => {
    return (
      <div style={{ maxHeight: "240px", overflowY: "auto", background: "gray", padding: "24px" }}>
        <DummyComponent {...args} />
      </div>
    );
  },
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
    items: dummyItems,
    gap: 16,
  },
};
