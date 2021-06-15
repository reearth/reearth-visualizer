import { useCallback, useRef } from "react";
import { useShallowCompareEffect, useUpdate } from "react-use";

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
  const update = useUpdate();
  const selectedItems = useRef<Map<string, [Item<T>, number[]]>>(new Map());
  const expandedItems = useRef<Map<string, [Item<T>, number[]]>>(new Map());
  const selectedIds = useRef<Set<string>>(new Set());
  const expandedIds = useRef<Set<string>>(new Set());

  const select = useCallback(
    (item: Item<T>, index: number[]) => {
      if (!multiple) {
        selectedItems.current.clear();
        selectedItems.current.set(item.id, [item, index]);
        selectedIds.current.clear();
        selectedIds.current.add(item.id);
      } else if (selectedItems.current.has(item.id)) {
        selectedItems.current.delete(item.id);
        selectedIds.current.delete(item.id);
      } else {
        selectedItems.current.set(item.id, [item, index]);
        selectedIds.current.add(item.id);
      }

      const values = Array.from(selectedItems.current.values());
      const indexes = values.map(v => v[1]);

      update();

      onSelect?.(
        values.map(v => v[0]),
        indexes,
      );
    },
    [onSelect, multiple, update],
  );

  const expand = useCallback(
    (item: Item<T>, index: number[], expanded: boolean) => {
      if (!expanded && expandedItems.current.has(item.id)) {
        expandedItems.current.delete(item.id);
        expandedIds.current.delete(item.id);
      } else if (expanded) {
        expandedItems.current.set(item.id, [item, index]);
        expandedIds.current.add(item.id);
      }

      const values = Array.from(expandedItems.current.values());
      const indexes = values.map(v => v[1]);

      update();

      onExpand?.(
        values.map(v => v[0]),
        indexes,
      );
    },
    [onExpand, update],
  );

  useShallowCompareEffect(() => {
    if (!Array.isArray(selected)) return;

    selectedItems.current.clear();
    selectedIds.current.clear();

    if (item?.children?.length) {
      const items = searchItems(item.children, selected).filter(
        (i): i is [Item<T>, number[]] => !!i,
      );
      items.forEach(i => {
        if (!i || typeof i[0] === "undefined") return;
        selectedItems.current.set(i[0].id, [i[0], i[1]]);
        selectedIds.current.add(i[0].id);
      });
    }

    update();
  }, [item, selected, update]);

  useShallowCompareEffect(() => {
    if (!Array.isArray(expanded)) return;

    if (item?.children?.length) {
      const items = searchItems(item.children, expanded).filter(
        (i): i is [Item<T>, number[]] => !!i,
      );
      items.forEach(i => {
        if (!i || typeof i[0] === "undefined") return;
        expandedItems.current.set(i[0].id, [i[0], i[1]]);
        expandedIds.current.add(i[0].id);
      });
    }

    update();
  }, [item, expanded, update]);

  return {
    select,
    expand,
    selectedIds: selectedIds.current,
    expandedIds: expandedIds.current,
  };
}
