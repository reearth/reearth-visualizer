import { Meta, StoryObj } from "@storybook/react-vite";
import { useCallback, useState } from "react";

import ListField, { ListFieldProps } from ".";

const meta: Meta<typeof ListField> = {
  component: ListField
};

export default meta;

type Story = StoryObj<typeof ListField>;


const DefaultComponent = (initialArgs: ListFieldProps) => {
  const [items, setItems] = useState(initialArgs.items);
  const [selected, setSelected] = useState(initialArgs.selected);

  const handleAdd = useCallback(() => {
    const randomId = (Math.random() + 1).toString(30).substring(9);
    setItems(prevItems => [
      ...prevItems,
      {
        id: randomId,
        title: `Item ${randomId}`
      }
    ]);
  }, []);

  const handleDelete = useCallback((key: string) => {
    setItems(prevItems => prevItems.filter(({ id }) => id !== key));
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelected(id);
  }, []);

  const handleItemMove = useCallback((id: string, targetIndex: number) => {
    setItems(prevItems => {
      const currentIndex = prevItems.findIndex((item) => item.id === id);
      if (currentIndex === -1 || currentIndex === targetIndex) return prevItems;

      const updatedItems = [...prevItems];
      const [movedItem] = updatedItems.splice(currentIndex, 1);
      updatedItems.splice(targetIndex, 0, movedItem);
      return updatedItems;
    });
  }, []);

  const handleItemNameUpdate = useCallback((id: string, newTitle: string) => {
    setItems(prevItems =>
      prevItems.map((item) =>
        item.id === id ? { ...item, title: newTitle } : item
      )
    );
  }, []);

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
        {...initialArgs}
        items={items}
        selected={selected}
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

export const Default: Story = {
  render: () => <DefaultComponent {...DefaultArgs} />
};

const DefaultArgs = {
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
