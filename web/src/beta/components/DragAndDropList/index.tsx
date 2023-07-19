import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

import { Item } from "./Item";

type Props<Item> = {
  uniqueKey: string;
  items: Item[];
  getId: (item: Item) => string;
  onItemDrop(item: Item, targetIndex: number): void;
  renderItem: (item: Item) => ReactNode;
};

function DragAndDropList<Item>({ uniqueKey, items, onItemDrop, getId, renderItem }: Props<Item>) {
  const [movingItems, setMovingItems] = useState<Item[]>(items);

  useEffect(() => {
    setMovingItems(items);
  }, [items]);

  const onItemMove = useCallback((dragIndex: number, hoverIndex: number) => {
    setMovingItems(old => {
      const items = [...old];
      items.splice(dragIndex, 1);
      items.splice(hoverIndex, 0, old[dragIndex]);
      return items;
    });
  }, []);

  const onItemDropLocal = useCallback(
    (index: number) => {
      const item = movingItems[index];
      item && onItemDrop(movingItems[index], index);
    },
    [movingItems, onItemDrop],
  );

  return (
    <div>
      {movingItems.map((item, i) => {
        const id = getId(item);
        return (
          <Item
            itemGroupKey={uniqueKey}
            key={id}
            id={id}
            index={i}
            onItemMove={onItemMove}
            onItemDrop={onItemDropLocal}>
            {renderItem(item)}
          </Item>
        );
      })}
    </div>
  );
}

export default DragAndDropList;
