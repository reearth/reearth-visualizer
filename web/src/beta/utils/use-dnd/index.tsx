import { ReactNode } from "react";
import { DndProvider, useDragLayer } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { ItemType } from "./types";

export * from "./types";
export * from "./drag";
export * from "./drop";

export const Provider: React.FC<{ children?: ReactNode }> = ({ children }) => (
  <DndProvider backend={HTML5Backend}>{children}</DndProvider>
);

export const useDraggingItemType = () =>
  useDragLayer(monitor => (monitor.isDragging() ? (monitor.getItemType() as ItemType) : null));
