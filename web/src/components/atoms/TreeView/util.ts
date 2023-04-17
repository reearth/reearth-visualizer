import { DropTargetMonitor } from "react-dnd";

import deepFind from "@reearth/util/deepFind";

import type { DropType, Item } from "./types";

export type DropPosition = {
  x: number;
  y: number;
  w: number;
  h: number;
  xr: number;
  yr: number;
};

export function searchItems<T = unknown>(items: Item<T>[], ids: string[]) {
  return ids.map(i =>
    deepFind(
      items,
      item => item.id === i,
      item => item.children,
    ),
  );
}

export function calcPosition(
  monitor: DropTargetMonitor,
  element: Element | null,
): DropPosition | undefined {
  if (!element) return undefined;

  const offset = monitor.getClientOffset();
  if (!offset) return undefined;

  const wrapperOffset = element.getBoundingClientRect();
  const x = offset.x - wrapperOffset.left;
  const y = offset.y - wrapperOffset.top;

  return {
    x,
    y,
    w: wrapperOffset.width,
    h: wrapperOffset.height,
    xr: x / wrapperOffset.width,
    yr: y / wrapperOffset.height,
  };
}

export function getDropType(
  pos: DropPosition,
  canDropAtChildren: boolean,
  expandedAndHasChildren: boolean,
): DropType {
  const bottom = pos.yr >= 0.5;
  return canDropAtChildren
    ? bottom
      ? expandedAndHasChildren
        ? "topOfChildren"
        : "bottom"
      : "bottomOfChildren"
    : bottom
    ? "bottom"
    : "top";
}

export function arrayEquals<T>(a: T[], b: T[]) {
  return a.length === b.length && a.every((e, i) => e === b[i]);
}

export function isSameParent(index: number[], index2: number[]) {
  return arrayEquals(index.slice(0, -1), index2.slice(0, -1));
}

export function isAncestor(index: number[], ancestor: number[]) {
  if (ancestor.length > index.length) return false;
  return ancestor.every((v, i) => index[i] === v);
}

export function getDestIndex(
  sourceIndex: number[] | undefined,
  index: number[],
  type: DropType,
  childrenCount = 0,
) {
  if (sourceIndex && arrayEquals(sourceIndex, index)) return [...index];
  if (type === "topOfChildren") return [...index, 0];

  if (type === "bottomOfChildren") {
    return sourceIndex && arrayEquals(sourceIndex.slice(0, -1), index)
      ? [...index, childrenCount - 1]
      : [...index, childrenCount];
  }

  const sourceIndex2 = sourceIndex?.[sourceIndex.length - 1];
  const index2 = index[index.length - 1];

  if (sourceIndex && !isSameParent(sourceIndex, index)) {
    return type === "bottom" ? [...index.slice(0, -1), index2 + 1] : [...index];
  }

  // a x b -> xa b : 0 top -> 0
  // a x b -> ax b : 0 bottom -> 1 (+1)
  // -----
  // a x b -> a xb : 2 top -> 1 (-1)
  // a x b -> a bx : 2 bottom -> 2

  const bellow = typeof sourceIndex2 === "number" && sourceIndex2 < index2;
  return [
    ...index.slice(0, -1),
    index2 + (type === "bottom" && !bellow ? 1 : type === "top" && bellow ? -1 : 0),
  ];
}
