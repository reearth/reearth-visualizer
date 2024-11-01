import { useArgs } from "@storybook/preview-api";
import { Meta, StoryObj } from "@storybook/react";
import { useCallback } from "react";

import ListField, { ListFieldProps } from ".";

const meta: Meta<typeof ListField> = {
  component: ListField
};

export default meta;

type Story = StoryObj<typeof ListField>;

export const Default: Story = (args: ListFieldProps) => {
  const [_, updateArgs] = useArgs();

  const handleAdd = useCallback(() => {
    const randomId = (Math.random() + 1).toString(30).substring(9);
    updateArgs({
      items: [
        ...args.items,
        {
          id: randomId,
          title: `Item ${randomId}`
        }
      ]
    });
  }, [updateArgs, args.items]);

  const handleDelete = useCallback(
    (key: string) => {
      updateArgs({ items: args.items.filter(({ id }) => id != key) });
    },
    [updateArgs, args.items]
  );

  const handleSelect = useCallback(
    (id: string) => updateArgs({ selected: id }),
    [updateArgs]
  );

  const handleItemMove = useCallback(
    (id: string, targetIndex: number) => {
      const currentIndex = args.items.findIndex((item) => item.id === id);
      if (currentIndex === -1 || currentIndex === targetIndex) return;

      const updatedItems = [...args.items];
      const [movedItem] = updatedItems.splice(currentIndex, 1);
      updatedItems.splice(targetIndex, 0, movedItem);

      updateArgs({ items: updatedItems });
    },
    [updateArgs, args.items]
  );
  const handleItemNameUpdate = useCallback(
    (id: string, newTitle: string) => {
      const updatedItems = args.items.map((item) =>
        item.id === id ? { ...item, title: newTitle } : item
      );
      updateArgs({ items: updatedItems });
    },
    [updateArgs, args.items]
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        width: "500px",
        margin: "0 auto"
      }}
    >
      <ListField
        {...args}
        atLeastOneItem={true}
        onItemAdd={handleAdd}
        onItemDelete={handleDelete}
        onItemSelect={handleSelect}
        onItemMove={handleItemMove}
        onItemNameUpdate={handleItemNameUpdate}
      />
    </div>
  );
};

Default.args = {
  title: "List Field",
  description: "List field Sample description",
  items: [
    {
      id: "1",
      title: "Item 1"
    },
    {
      id: "2",
      title: "Item 2"
    },
    {
      id: "3",
      title: "Item 3"
    },
    {
      id: "4",
      title: "Item 4"
    },
    {
      id: "5",
      title: "Item 5"
    },
    {
      id: "6",
      title: "Item 6"
    }
  ]
};
