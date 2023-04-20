import { useCallback, useRef } from "react";
import { useShallowCompareEffect, useSet } from "react-use";

import { Item } from "./types";
import { searchItems } from "./util";

export default function <T = unknown>({
  item,
  selected,
  expanded,
  multiple,
  onSelect,
  onExpand,
}: {
  item?: Item<T>;
  selected?: string[];
  expanded?: string[];
  multiple?: boolean;
  onSelect?: (selected: Item<T>[], index: number[][]) => void;
  onExpand?: (expanded: Item<T>[], index: number[][]) => void;
}) {
  const selectedItems = useRef<Map<string, [Item<T>, number[]]>>(new Map());
  const expandedItems = useRef<Map<string, [Item<T>, number[]]>>(new Map());
  const [selectedIds, selectedIdsActions] = useSet<string>();
  const [expandedIds, expandedIdsActions] = useSet<string>();

  const select = useCallback(
    (item: Item<T>, index: number[]) => {
      if (!multiple) {
        selectedItems.current.clear();
        selectedItems.current.set(item.id, [item, index]);
        selectedIdsActions.reset();
        selectedIdsActions.add(item.id);
      } else if (selectedItems.current.has(item.id)) {
        selectedItems.current.delete(item.id);
        selectedIdsActions.remove(item.id);
      } else {
        selectedItems.current.set(item.id, [item, index]);
        selectedIdsActions.add(item.id);
      }

      const values = Array.from(selectedItems.current.values());
      onSelect?.(
        values.map(v => v[0]),
        values.map(v => v[1]),
      );
    },
    [multiple, onSelect, selectedIdsActions],
  );

  const expand = useCallback(
    (item: Item<T>, index: number[], expanded: boolean) => {
      if (!expanded && expandedItems.current.has(item.id)) {
        expandedItems.current.delete(item.id);
        expandedIdsActions.remove(item.id);
      } else if (expanded) {
        expandedItems.current.set(item.id, [item, index]);
        expandedIdsActions.add(item.id);
      }

      const values = Array.from(expandedItems.current.values());
      onExpand?.(
        values.map(v => v[0]),
        values.map(v => v[1]),
      );
    },
    [expandedIdsActions, onExpand],
  );

  useShallowCompareEffect(() => {
    if (!Array.isArray(selected)) return;

    selectedItems.current.clear();
    selectedIdsActions.reset();

    if (item?.children?.length) {
      const items = searchItems(item.children, selected).filter(
        (i): i is [Item<T>, number[]] => !!i,
      );
      items.forEach(i => {
        if (!i || typeof i[0] === "undefined") return;
        selectedItems.current.set(i[0].id, [i[0], i[1]]);
        selectedIdsActions.add(i[0].id);
      });
    }
  }, [item, selected]);

  useShallowCompareEffect(() => {
    if (!Array.isArray(expanded)) return;

    if (item?.children?.length) {
      const items = searchItems(item.children, expanded).filter(
        (i): i is [Item<T>, number[]] => !!i,
      );
      items.forEach(i => {
        if (!i || typeof i[0] === "undefined") return;
        expandedItems.current.set(i[0].id, [i[0], i[1]]);
        expandedIdsActions.add(i[0].id);
      });
    }
  }, [item, expanded]);

  return {
    select,
    expand,
    selectedIds,
    expandedIds,
  };
}
