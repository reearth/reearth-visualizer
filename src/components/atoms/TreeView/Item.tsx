import React, { useCallback, useState, ReactElement, useRef, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";

import Items from "./Items";
import type { Item as ItemType, InnerProps, DropType } from "./types";
import { arrayEquals, calcPosition, getDestIndex, getDropType, isAncestor } from "./util";

export type Props<T = unknown, R extends Element = Element> = InnerProps<T, R> & {
  item: ItemType<T>;
  parentItem: ItemType<T>;
  selected: boolean;
  expanded: boolean;
};

type DnDItem<T> = { type: string; item: ItemType<T>; index: number[]; parentItem: ItemType<T> };

export default function Item<T = unknown, R extends Element = Element>({
  item,
  shown,
  selected,
  expanded,
  selectedIds,
  expandedIds,
  index,
  parentItem,
  renderItem: ItemComponent,
  onSelect,
  onExpand,
  ...props
}: Props<T, R>): ReactElement | null {
  const selectable = !!props.selectable && !!item.selectable;
  const expandable = !!props.expandable && !!item.expandable;
  const draggable = !!props.dragItemType && !!props.draggable && !!item.draggable && !!shown;
  const droppable = !!props.dragItemType && !!props.droppable && !!item.droppable && !!shown;
  const canDropAtChildren = droppable && !!item.droppableIntoChildren;
  const nextItemDroppable = !!parentItem.children?.[index[index.length - 1] + 1]?.droppable;

  const handleExpand = useCallback(() => {
    if (!expandable) return;
    onExpand?.(item, index, !expanded);
  }, [expandable, expanded, index, item, onExpand]);

  const handleSelect = useCallback(() => {
    if (!selectable) return;
    onSelect?.(item, index);
  }, [selectable, item, onSelect, index]);

  const wrapperRef = useRef<R>(null);

  const [{ isDragging }, dragRef] = useDrag<DnDItem<T>, unknown, { isDragging: boolean }>({
    type: props.dragItemType ?? "",
    item: { type: props.dragItemType ?? "", item, index, parentItem },
    canDrag: draggable,
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [dropType, setDropType] = useState<DropType>();
  const [canDrop, setCanDrop] = useState(false);

  const [{ isDropping }, dropRef] = useDrop<any, unknown, { isDropping: boolean }>({
    accept: [
      ...(props.dragItemType ? [props.dragItemType] : []),
      ...(props.acceptedDragItemTypes ?? []),
    ],
    canDrop: (i, monitor) => {
      if (
        (!nextItemDroppable && !droppable) ||
        !index.length ||
        (!item.droppableExternals && i.type !== props.dragItemType) ||
        !monitor.isOver({ shallow: true })
      ) {
        return false;
      }

      if (
        i.type === props.dragItemType &&
        "index" in i &&
        (!i.index.length || arrayEquals(index, i.index) || isAncestor(index, i.index))
      ) {
        return false;
      }

      const pos = calcPosition(monitor, wrapperRef.current);
      if (!pos) {
        return false;
      }

      const type = getDropType(pos, canDropAtChildren, expanded && !!item.children?.length);
      if (
        ((type === "topOfChildren" || type === "bottomOfChildren") && !item.droppable) ||
        (!droppable && nextItemDroppable && type !== "bottom")
      ) {
        return false;
      }

      if (item.droppableExternals && i.type !== props.dragItemType) {
        return true;
      }

      if (!("index" in i)) {
        return false;
      }

      const destIndex = getDestIndex(i.index, index, type, item.children?.length);
      return !arrayEquals(i.index, destIndex);
    },
    hover: (_i, monitor) => {
      const pos = calcPosition(monitor, wrapperRef.current);
      const type = pos
        ? getDropType(pos, canDropAtChildren, expanded && !!item.children?.length)
        : undefined;
      setDropType(type);
      setCanDrop(monitor.canDrop());
    },
    collect: monitor => ({
      isDropping: monitor.isOver({ shallow: true }),
    }),
    drop: (i, monitor) => {
      const pos = calcPosition(monitor, wrapperRef.current);
      if (!pos) return;

      function isDnDItem(d: any): d is DnDItem<T> {
        return d.type === props.dragItemType;
      }

      const type = getDropType(pos, canDropAtChildren, expanded && !!item.children?.length);
      const destIndex = getDestIndex(
        isDnDItem(i) ? i.index : undefined,
        index,
        type,
        item.children?.length,
      );
      const destItem = type === "top" || type === "bottom" ? parentItem : item;

      if (isDnDItem(i)) {
        if (arrayEquals(i.index, destIndex)) return;
        props.onDrop?.(i.item, destItem, i.index, destIndex, i.parentItem);
        return;
      }

      return props.onDropExternals?.(i, destItem, destIndex);
    },
  });

  useEffect(() => {
    if (!isDropping) {
      setCanDrop(false);
      setDropType(undefined);
    }
  }, [isDropping]);

  dropRef(dragRef(wrapperRef));

  const children = item.children ? (
    <Items<T, R>
      {...props}
      shown={expanded}
      renderItem={ItemComponent}
      selectedIds={selectedIds}
      expandedIds={expandedIds}
      index={index}
      depth={props.depth + 1}
      item={item}
      onSelect={onSelect}
      onExpand={onExpand}
    />
  ) : null;

  const childSelected = !!item.children?.find(c => selectedIds?.has(c?.id));

  return (
    <ItemComponent
      {...props}
      ref={wrapperRef}
      item={item}
      index={index}
      onSelect={handleSelect}
      onExpand={handleExpand}
      selected={selected}
      expanded={expanded}
      multiple={!!props.multiple}
      isDragging={isDragging}
      isDropping={isDropping}
      dropType={dropType}
      canDrop={canDrop}
      depth={props.depth}
      selectable={selectable}
      expandable={expandable}
      draggable={draggable}
      droppable={droppable}
      shown={!!shown}
      siblings={parentItem.children}
      childSelected={childSelected}>
      {children}
    </ItemComponent>
  );
}
