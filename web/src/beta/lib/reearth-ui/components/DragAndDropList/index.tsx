// DragAndDropList.tsx
import React, { useCallback } from "react";
import {
  ReactSortable,
  Sortable,
  Store,
  ItemInterface,
  GroupOptions,
  SortableEvent,
} from "react-sortablejs";

import { styled } from "@reearth/services/theme";

export interface DragAndDropListProps<T extends ItemInterface> {
  items?: T[];
  setItems?: React.Dispatch<React.SetStateAction<T[]>>;
  className?: string;
  group?: string | GroupOptions;
  handleClassName?: string;
  gap?: "normal" | "small" | number;
  dragDisabled?: boolean;
  onMoveStart?: () => void;
  onMoveEnd?: (itemId?: string, newIndex?: number) => void;
}

const GHOST_CLASSNAME = "reearth-visualizer-dnd-ghost";
const NO_DRAG_CLASSNAME = "reearth-visualizer-dnd-no-drag";

export const DragAndDropList = <T extends ItemInterface>({
  items,
  setItems,
  className,
  group,
  handleClassName,
  gap = "small",
  dragDisabled,
  onMoveStart,
  onMoveEnd,
}: DragAndDropListProps<T>) => {
  const handleSetList = (newState: ItemInterface[], _sortable: Sortable | null, _store: Store) => {
    setItems?.(newState as T[]);
  };

  const handleStart = useCallback(() => {
    onMoveStart?.();
  }, [onMoveStart]);

  const handleEnd = useCallback(
    (evt: SortableEvent) => {
      onMoveEnd?.(evt.item?.dataset.id, evt.newIndex);
    },
    [onMoveEnd],
  );

  return (
    <StyledReactSortable
      list={items}
      setList={handleSetList}
      group={group}
      className={className}
      gap={gap}
      handle={handleClassName ? `.${handleClassName}` : undefined}
      animation={150}
      ghostClass={GHOST_CLASSNAME}
      filter={`.${NO_DRAG_CLASSNAME}`}
      onStart={handleStart}
      onEnd={handleEnd}>
      {items?.map(item => (
        <ItemWrapper key={item.id} className={dragDisabled ? NO_DRAG_CLASSNAME : ""}>
          {item.content}
        </ItemWrapper>
      ))}
    </StyledReactSortable>
  );
};

export default DragAndDropList;

const StyledReactSortable = styled(ReactSortable)<{ gap?: "normal" | "small" | number }>(
  ({ theme, gap }) => ({
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap:
      gap === "small" ? theme.spacing.smallest : gap === "normal" ? theme.spacing.small : gap ?? 0,
    [`.${GHOST_CLASSNAME}`]: {
      opacity: 0,
    },
  }),
);

const ItemWrapper = styled("div")(() => ({}));
