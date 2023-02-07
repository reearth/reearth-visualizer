import { useCallback } from "react";
import type { Alignment } from "react-align";

import type { Widget } from "../Widget";

import { getLocationFromId } from "./Area";

export type { Alignment } from "react-align";

export type { Widget } from "../Widget";

export type Location = {
  zone: "inner" | "outer";
  section: "left" | "center" | "right";
  area: "top" | "middle" | "bottom";
};

export type WidgetAreaPadding = { top: number; bottom: number; left: number; right: number };

export type WidgetArea = {
  align: Alignment;
  padding?: WidgetAreaPadding;
  widgets?: Widget[];
  gap?: number;
  centered?: boolean;
  background?: string;
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
  onWidgetAlignSystemUpdate,
}: {
  onWidgetUpdate?: (
    id: string,
    update: { location?: Location; extended?: boolean; index?: number },
  ) => void;
  onWidgetAlignSystemUpdate?: (location: Location, align: Alignment) => void;
}) {
  const handleMove = useCallback(
    (id: string, area: string, index: number, prevArea: string, _prevIndex: number) => {
      const location = area !== prevArea ? getLocationFromId(area) : undefined;
      onWidgetUpdate?.(id, { index, location });
    },
    [onWidgetUpdate],
  );

  const handleExtend = useCallback(
    (id: string, extended: boolean) => {
      onWidgetUpdate?.(id, { extended });
    },
    [onWidgetUpdate],
  );

  const handleAlignmentChange = useCallback(
    (id: string, a: Alignment) => {
      const l = getLocationFromId(id);
      if (!l) return;
      onWidgetAlignSystemUpdate?.(l, a);
    },
    [onWidgetAlignSystemUpdate],
  );

  return { handleMove, handleExtend, handleAlignmentChange };
}

export type WidgetLayoutConstraint = {
  extendable?: {
    horizontally?: boolean;
    vertically?: boolean;
  };
};
