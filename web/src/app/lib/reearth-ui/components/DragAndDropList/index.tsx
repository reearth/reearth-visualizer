// DragAndDropList.tsx
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import React, { useCallback } from "react";
import {
  ReactSortable,
  Sortable,
  Store,
  ItemInterface,
  GroupOptions,
  SortableEvent
} from "react-sortablejs";

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
  ariaLabel?: string;
  dataTestid?: string;
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
  ariaLabel,
  dataTestid
}: DragAndDropListProps<T>) => {
  const handleSetList = (
    newState: ItemInterface[],
    _sortable: Sortable | null,
    _store: Store
  ) => {
    setItems?.(newState as T[]);
  };

  const handleStart = useCallback(() => {
    onMoveStart?.();
  }, [onMoveStart]);

  const handleEnd = useCallback(
    (evt: SortableEvent) => {
      onMoveEnd?.(evt.item?.dataset.id, evt.newIndex);
    },
    [onMoveEnd]
  );

  return (
    <div role="list" aria-label={ariaLabel} data-testid={dataTestid}>
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
        onEnd={handleEnd}
      >
        {items?.map((item, index) => (
          <ItemWrapper
            key={item.id}
            className={dragDisabled ? NO_DRAG_CLASSNAME : ""}
            role="listitem"
            data-testid={dataTestid && `${dataTestid}-${index}`}
          >
            {item.content}
          </ItemWrapper>
        ))}
      </StyledReactSortable>
    </div>
  );
};

export default DragAndDropList;

const StyledReactSortable = styled(ReactSortable)<{
  gap?: "normal" | "small" | number;
}>(({ theme, gap }) => ({
  position: css.position.relative,
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap:
    gap === "small"
      ? theme.spacing.smallest
      : gap === "normal"
        ? theme.spacing.small
        : (gap ?? 0),
  [`.${GHOST_CLASSNAME}`]: {
    opacity: 0
  }
}));

const ItemWrapper = styled("div")(() => ({}));
