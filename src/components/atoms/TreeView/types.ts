import { PropsWithoutRef, ReactNode, RefAttributes } from "react";

export type DropType = "top" | "bottom" | "topOfChildren" | "bottomOfChildren";

export type ItemProps<T = unknown> = {
  children?: ReactNode;
  item: Item<T>;
  index: number[];
  selected: boolean;
  childSelected: boolean;
  expanded: boolean;
  multiple: boolean;
  depth: number;
  isDragging: boolean;
  isDropping: boolean;
  canDrop: boolean;
  dropType?: DropType;
  selectable: boolean;
  expandable: boolean;
  draggable: boolean;
  droppable: boolean;
  shown: boolean;
  siblings?: Item<T>[];
  onExpand: () => void;
  onSelect: () => void;
};

export type InnerProps<T = unknown, R extends Element = Element> = {
  multiple?: boolean;
  depth: number;
  index: number[];
  shown?: boolean;
  selectedIds?: Set<string>;
  expandedIds?: Set<string>;
  selectable?: boolean;
  expandable?: boolean;
  draggable?: boolean;
  droppable?: boolean;
  dragItemType?: string;
  acceptedDragItemTypes?: string[];
  onExpand?: (item: Item<T>, index: number[], expanded: boolean) => void;
  onSelect?: (selected: Item<T>, index: number[]) => void;
  onDrop?: (
    item: Item<T>,
    destItem: Item<T>,
    index: number[],
    destIndex: number[],
    parentItem: Item<T>,
  ) => void;
  onDropExternals?: (item: any, destItem: Item<T>, destIndex: number[]) => any;
  renderItem: React.ComponentType<PropsWithoutRef<ItemProps<T>> & RefAttributes<R>>;
};

export type Item<T = unknown> = {
  id: string;
  children?: Item<T>[];
  selectable?: boolean;
  draggable?: boolean;
  droppable?: boolean;
  expandable?: boolean;
  droppableIntoChildren?: boolean;
  droppableExternals?: boolean;
  content: T;
};
