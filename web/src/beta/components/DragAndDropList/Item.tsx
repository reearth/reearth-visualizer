import type { Identifier, XYCoord } from "dnd-core";
import type { FC, ReactNode } from "react";
import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";

import { styled } from "@reearth/services/theme";

type DragItem = {
  index: number;
  id: string;
  type: string;
};

type Props = {
  itemGroupKey: string;
  id: string;
  index: number;
  onItemMove: (dragIndex: number, hoverIndex: number) => void;
  onItemDrop: (dropIndex: number) => void;
  children: ReactNode;
};

export const Item: FC<Props> = ({ itemGroupKey, id, children, index, onItemMove, onItemDrop }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: itemGroupKey,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      onItemMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    drop(item) {
      onItemDrop(item.index);
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: itemGroupKey,
    item: () => {
      return { id, index };
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));
  return (
    <SItem ref={ref} data-handler-id={handlerId} isDragging={isDragging}>
      {children}
    </SItem>
  );
};

export default memo(Item);

const SItem = styled.div<{ isDragging: boolean }>`
  ${({ isDragging }) => `opacity: ${isDragging ? 0 : 1};`}
  cursor: move;
`;
