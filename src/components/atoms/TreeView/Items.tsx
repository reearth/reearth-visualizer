import React, { ReactElement } from "react";

import Item from "./Item";
import type { Item as ItemType, InnerProps } from "./types";

export type Props<T = unknown, R extends Element = Element> = InnerProps<T, R> & {
  item?: ItemType<T>;
};

export default function Items<T = unknown, R extends Element = Element>({
  item: parentItem,
  selectedIds,
  expandedIds,
  index,
  ...props
}: Props<T, R>): ReactElement | null {
  return (
    <>
      {parentItem?.children?.map((item, i) => {
        return (
          <Item<T, R>
            {...props}
            key={item.id}
            item={item}
            index={[...index, i]}
            selectedIds={selectedIds}
            expandedIds={expandedIds}
            selected={!!selectedIds?.has(item.id)}
            expanded={!!expandedIds?.has(item.id)}
            parentItem={parentItem}
          />
        );
      })}
    </>
  );
}
