import { useCallback } from "react";
import type { Alignment } from "react-align";

import { Widget as WidgetType } from "../Widget";

export type { Alignment } from "react-align";

export type Widget = Omit<WidgetType, "layout">;

export type Location = {
  zone: "inner" | "outer";
  section: "left" | "center" | "right";
  area: "top" | "middle" | "bottom";
};

export type WidgetArea = {
  align: Alignment;
  widgets?: Widget[];
};

export type WidgetSection = {
  top?: WidgetArea;
  middle?: WidgetArea;
  bottom?: WidgetArea;
};

export type WidgetZone = {
  left?: WidgetSection;
  center?: WidgetSection;
  right?: WidgetSection;
};

export type WidgetAlignSystem = {
  outer?: WidgetZone;
  inner?: WidgetZone;
};

export type WidgetLayout = {
  extended?: boolean;
  layout?: Location;
  index?: number;
  align?: string;
};

export default function ({
  onWidgetUpdate,
}: {
  onWidgetUpdate?: (
    id: string,
    update: { location?: Location; extended?: boolean; index?: number },
  ) => void;
}) {
  const onReorder = useCallback(
    (id: string, index: number) => {
      onWidgetUpdate?.(id, { index });
    },
    [onWidgetUpdate],
  );

  const onMove = useCallback(
    (currentItem: string, location: Location) => {
      onWidgetUpdate?.(currentItem, { location });
    },
    [onWidgetUpdate],
  );

  const onExtend = useCallback(
    (currentItem: string, extended: boolean) => {
      onWidgetUpdate?.(currentItem, { extended });
    },
    [onWidgetUpdate],
  );

  return { onReorder, onMove, onExtend };
}

export type WidgetLayoutConstraint = {
  extendable?: {
    horizontally?: boolean;
    vertically?: boolean;
  };
};
