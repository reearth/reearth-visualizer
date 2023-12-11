import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { useDragDropManager } from "react-dnd";

import { styled } from "@reearth/services/theme";

import Item from "./Item";
import { useScroll } from "./scrollItem";

export type Props<Item extends { id: string } = { id: string }> = {
  uniqueKey: string;
  items: Item[];
  getId: (item: Item) => string;
  onItemDrop(item: Item, targetIndex: number): void;
  renderItem: (item: Item, index: number) => ReactNode;
  gap?: number;
};

function DragAndDropList<Item extends { id: string } = { id: string }>({
  uniqueKey,
  items,
  onItemDrop,
  getId,
  renderItem,
  gap,
}: Props<Item>) {
  const [movingItems, setMovingItems] = useState<Item[]>(items);
  const { scrollContainerRef } = useScroll();
  const dragDropManager = useDragDropManager();
  const monitor = dragDropManager.getMonitor();
  const [, setIsMonitor] = useState(0);

  useEffect(() => {
    const unsubscribe = monitor.subscribeToOffsetChange(() => {
      const offset = monitor.getSourceClientOffset()?.y as number;
      setIsMonitor(offset);
    });
    return unsubscribe;
  }, [monitor]);

  const customDragHandler = (item: Item): boolean => {
    // eslint-disable-next-line no-prototype-builtins
    return item.hasOwnProperty("extensionId");
  };

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

  const onItemDropOnItem = useCallback(
    (index: number) => {
      const item = movingItems[index];
      if (items[index].id === item.id) return;
      item && onItemDrop(movingItems[index], index);
    },
    [items, movingItems, onItemDrop],
  );

  const onItemDropOutside = useCallback(() => {
    setMovingItems(items);
  }, [items]);

  return (
    <SWrapper gap={gap} ref={scrollContainerRef}>
      {movingItems.map((item, i) => {
        const id = getId(item);
        const shouldUseCustomHandler = customDragHandler(item);
        return (
          <Item
            itemGroupKey={uniqueKey}
            key={id}
            id={item.id}
            index={i}
            onItemMove={onItemMove}
            onItemDropOnItem={onItemDropOnItem}
            onItemDropOutside={onItemDropOutside}
            shouldUseCustomHandler={shouldUseCustomHandler}>
            {renderItem(item, i)}
          </Item>
        );
      })}
    </SWrapper>
  );
}

export default DragAndDropList;

const SWrapper = styled.div<Pick<Props, "gap">>`
  display: flex;
  flex-direction: column;
  ${({ gap }) => gap && `gap: ${gap}px;`}
`;
