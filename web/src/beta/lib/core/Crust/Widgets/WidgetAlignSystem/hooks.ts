import { useCallback } from "react";

import { getLocationFromId } from "./Area";
import type { Location, Alignment } from "./types";

export default function ({
  onWidgetLayoutUpdate: onWidgetLayoutUpdate,
  onAlignmentUpdate: onAlignmentUpdate,
}: {
  onWidgetLayoutUpdate?: (
    id: string,
    update: { location?: Location; extended?: boolean; index?: number },
  ) => void;
  onAlignmentUpdate?: (location: Location, align: Alignment) => void;
}) {
  const handleMove = useCallback(
    (id: string, area: string, index: number, prevArea: string, _prevIndex: number) => {
      const location = area !== prevArea ? getLocationFromId(area) : undefined;
      onWidgetLayoutUpdate?.(id, { index, location });
    },
    [onWidgetLayoutUpdate],
  );

  const handleExtend = useCallback(
    (id: string, extended: boolean) => {
      onWidgetLayoutUpdate?.(id, { extended });
    },
    [onWidgetLayoutUpdate],
  );

  const handleAlignmentChange = useCallback(
    (id: string, a: Alignment) => {
      const l = getLocationFromId(id);
      if (!l) return;
      onAlignmentUpdate?.(l, a);
    },
    [onAlignmentUpdate],
  );

  return { handleMove, handleExtend, handleAlignmentChange };
}
