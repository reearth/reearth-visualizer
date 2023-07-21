import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

import { styled } from "@reearth/services/theme";

import Item from "./Item";

type Props<Item> = {
  uniqueKey: string;
  items: Item[];
  getId: (item: Item) => string;
  onItemDrop(item: Item, targetIndex: number): void;
  renderItem: (item: Item) => ReactNode;
  gap: number;
};

function DragAndDropList<Item>({
  uniqueKey,
  items,
  onItemDrop,
  getId,
  renderItem,
  gap,
}: Props<Item>) {
  const [movingItems, setMovingItems] = useState<Item[]>(items);

  useEffect(() => {
    setMovingItems(items);
  }, [items]);

  const findItem = useCallback(
    (id: string) => {
      const matched = movingItems.find(item => getId(item) === id);
      return matched ? movingItems.findIndex(item => getId(item) === getId(matched)) : undefined;
    },
    [getId, movingItems],
  );

  const onItemMove = useCallback(
    (id: string, hoverIndex: number) => {
      setMovingItems(old => {
        const index = findItem(id);
        if (index == null) return old;
        const items = [...old];
        items.splice(index, 1);
        items.splice(hoverIndex, 0, old[index]);
        return items;
      });
    },
    [findItem],
  );

  const onItemDropLocal = useCallback(
    (id: string) => {
      const itemFinalIndex = movingItems.findIndex(item => id === getId(item));
      if (itemFinalIndex === -1) return;
      onItemDrop(movingItems[itemFinalIndex], itemFinalIndex);
    },
    [getId, movingItems, onItemDrop],
  );

  return (
    <SWrapper gap={gap}>
      {movingItems.map(item => {
        const id = getId(item);
        return (
          <Item
            itemGroupKey={uniqueKey}
            key={id}
            id={id}
            onItemMove={onItemMove}
            findItem={findItem}
            onItemDrop={onItemDropLocal}>
            {renderItem(item)}
          </Item>
        );
      })}
    </SWrapper>
  );
}

export default DragAndDropList;

const SWrapper = styled.div<Pick<Props<unknown>, "gap">>`
  display: flex;
  flex-direction: column;
  ${({ gap }) => `gap: ${gap}px`}
`;
