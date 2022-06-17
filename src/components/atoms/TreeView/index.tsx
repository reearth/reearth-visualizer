import { ReactNode, ReactElement } from "react";

import Scroll from "../Scroll";

import useHooks from "./hooks";
import Items from "./Items";
import type { Item, InnerProps } from "./types";

export type { Item, ItemProps, DropType } from "./types";

export { searchItems } from "./util";

export type Props<T = unknown, R extends Element = Element> = Omit<
  InnerProps<T, R>,
  "index" | "selectedIndex" | "depth" | "onSelect" | "parentItemId"
> & {
  className?: string;
  children?: ReactNode;
  item: Item<T>;
  selected?: string[];
  expanded?: string[];
  onSelect?: (selected: Item<T>[], index: number[][]) => void;
  onExpand?: (expanded: Item<T>[], index: number[][]) => void;
};

export default function TreeView<T = unknown, R extends Element = Element>({
  className,
  item,
  selected,
  expanded,
  onSelect,
  onExpand,
  ...props
}: Props<T, R>): ReactElement | null {
  const { selectedIds, expandedIds, select, expand } = useHooks({
    item,
    selected,
    expanded,
    multiple: props.multiple,
    onSelect,
    onExpand,
  });

  return (
    <Scroll className={className}>
      <Items<T, R>
        {...props}
        item={item}
        index={[]}
        onSelect={select}
        onExpand={expand}
        selectedIds={selectedIds}
        expandedIds={expandedIds}
        depth={0}
        shown
      />
    </Scroll>
  );
}
