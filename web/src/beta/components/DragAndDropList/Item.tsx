import type { Identifier } from "dnd-core";
import type { FC, ReactNode } from "react";
import { memo, useRef, createContext, useContext } from "react";
import { ConnectDragPreview, ConnectDragSource, useDrag, useDrop } from "react-dnd";

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
  shouldUseCustomHandler?: boolean;
  onItemMove: (dragIndex: number, hoverIndex: number) => void;
  onItemDropOnItem: (dropIndex: number) => void;
  onItemDropOutside: () => void;
  children: ReactNode;
};

const ItemContext = createContext<{
  customDragSource: ConnectDragSource;
  customDragPreview: ConnectDragPreview;
} | null>(null);

export const useItemContext = () => useContext(ItemContext);

const Item: FC<Props> = ({
  itemGroupKey,
  id,
  children,
  index,
  shouldUseCustomHandler,
  onItemMove,
  onItemDropOnItem,
  onItemDropOutside,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: itemGroupKey,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!contentRef.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      // Determine rectangle on screen
      const hoverBoundingRect = contentRef.current?.getBoundingClientRect();

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Get vertical middle Y
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      onItemMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: itemGroupKey,
    item: () => {
      return { id, index };
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const didDrop = monitor.didDrop();
      if (didDrop) {
        onItemDropOnItem(item.index);
      } else {
        onItemDropOutside();
      }
    },
  });

  drop(contentRef);

  return shouldUseCustomHandler ? (
    <ItemContext.Provider value={{ customDragSource: drag, customDragPreview: preview }}>
      <SItem
        customHandler={shouldUseCustomHandler}
        data-handler-id={handlerId}
        isDragging={isDragging}>
        <div ref={contentRef}>{children}</div>
      </SItem>
    </ItemContext.Provider>
  ) : (
    <SItem ref={drag} data-handler-id={handlerId} isDragging={isDragging}>
      <div ref={contentRef}>{children}</div>
    </SItem>
  );
};

export default memo(Item);

const SItem = styled.div<{ isDragging: boolean; customHandler?: boolean }>`
  ${({ isDragging }) => `opacity: ${isDragging ? 0 : 1};`}
  cursor: ${({ customHandler }) => (customHandler ? "default" : "move")};
`;
