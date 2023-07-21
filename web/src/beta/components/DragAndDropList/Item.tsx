import type { FC, ReactNode } from "react";
import { memo, useMemo } from "react";
import { useDrag, useDrop } from "react-dnd";

import { styled } from "@reearth/services/theme";

type Props = {
  itemGroupKey: string;
  id: string;
  onItemMove: (id: string, hoverIndex: number) => void;
  findItem: (id: string) => number | undefined;
  onItemDrop: (id: string) => void;
  children: ReactNode;
};

type DragItem = {
  id: string;
  originalIndex: number;
};

const Item: FC<Props> = ({ itemGroupKey, id, children, findItem, onItemMove, onItemDrop }) => {
  const thisItemsOriginalIndex = useMemo(() => findItem(id), [findItem, id]);
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: itemGroupKey,
      item: { id, originalIndex: thisItemsOriginalIndex },
      collect: monitor => ({
        isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
        const { id: droppedId, originalIndex } = item;
        const didDrop = monitor.didDrop();
        if (!didDrop && originalIndex !== undefined) {
          console.log("when it happens? 1");
          onItemMove(droppedId, originalIndex);
        } else {
          onItemDrop(droppedId);
        }
      },
    }),
    [id, thisItemsOriginalIndex, onItemMove],
  );

  const [, drop] = useDrop(
    () => ({
      accept: itemGroupKey,
      hover({ id: draggedId }: DragItem) {
        if (draggedId !== id) {
          console.log("whats this 3 / ", draggedId, id);
          const overIndex = findItem(id);
          if (overIndex === undefined) return;
          onItemMove(draggedId, overIndex);
        }
      },
    }),
    [findItem, onItemMove],
  );

  return (
    <SItem ref={node => drag(drop(node))} isDragging={isDragging}>
      {children}
    </SItem>
  );
};

export default memo(Item);

const SItem = styled.div<{ isDragging: boolean }>`
  ${({ isDragging }) => `opacity: ${isDragging ? 0 : 1};`}
  cursor: move;
`;
