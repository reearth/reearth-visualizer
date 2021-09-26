import { useMemo } from "react";
import { useDrag as useDndDrag, DragSourceHookSpec } from "react-dnd";

import { Item, ItemType, Dropper } from "./types";

export const useDrag = <T extends ItemType = ItemType>(
  item: Item<T> | undefined,
  disabled?: boolean,
  end?: (item: Item<T>, dropper?: Dropper) => void,
) => {
  const options = useMemo<
    DragSourceHookSpec<
      Item<T> | Item<"null">,
      unknown,
      {
        isDragging: boolean;
      }
    >
  >(
    () => ({
      type: item?.type ?? "null",
      item: item ?? { type: "null" },
      canDrag: !!item && !disabled,
      end: (item, monitor) => end?.(item as Item<T>, monitor.getDropResult() ?? undefined),
      collect: monitor => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [disabled, end, item],
  );

  const [{ isDragging }, ref, previewRef] = useDndDrag(options);
  return { ref, isDragging, previewRef };
};
