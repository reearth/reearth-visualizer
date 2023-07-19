import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

import { ItemWrapper } from "./ItemWrapper";

type Props<Item> = {
  items: Item[];
  getId: (item: Item) => string;
  onDrop(id: string, index: number): void;
  renderItem: (item: Item) => ReactNode;
};

function DragAndDropList<Item>({ items, onDrop, getId, renderItem }: Props<Item>) {
  console.log(onDrop);
  const [movingItems, setMovingItems] = useState<Item[]>(items);

  useEffect(() => {
    setMovingItems(items);
  }, [items]);

  const onItemMove = useCallback((dragIndex: number, hoverIndex: number) => {
    setMovingItems((old: Item[]) => {
      const items = [...old];
      items.splice(dragIndex, 1);
      items.splice(hoverIndex, 0, old[dragIndex]);
      return items;
    });
  }, []);

  return (
    <div>
      {movingItems.map((item, i) => {
        const id = getId(item);
        return (
          <ItemWrapper key={id} index={i} id={id} onItemMove={onItemMove}>
            {renderItem(item)}
          </ItemWrapper>
        );
      })}
    </div>
  );
}

export default DragAndDropList;
